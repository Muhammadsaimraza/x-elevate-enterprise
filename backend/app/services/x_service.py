"""X (Twitter) API service.

Real integration performs httpx calls against X's web REST surface
(``https://x.com/i/api/...``), authenticating with the per-user ``auth_token``
session cookie stored on the User model (``users.x_auth_token``). A random
``ct0`` value is generated per request and mirrored into the ``x-csrf-token``
header, matching the cookie/header CSRF contract the X web client follows.

Every public method returns the same response envelope::

    {
        "status": "ok" | "demo",          # "ok" = live call succeeded
        "source": "live" | "demo",
        "data": {...},                    # method-specific payload
        "fallback_reason": "no_auth_token" | "request_failed",  # demo only
        "error": "...",                   # demo-after-failure only
    }

When no token is supplied — or a live request fails for any reason (network
error, expired session, unexpected response shape) — the method falls back
to structured demo data so agent flows never crash and always receive a
payload matching the expected schema.

The endpoints below are the same private REST endpoints the X web client
calls. X rotates and deprecates these without notice; any failure simply
triggers the demo fallback described above.
"""

import logging
import random
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# X web API constants
# ---------------------------------------------------------------------------

X_API_BASE = "https://x.com/i/api"

# Public bearer token embedded in every X web client build. It is not a user
# secret — it identifies the "Twitter Web App" client and must accompany the
# session cookies for /i/api requests to authenticate.
X_WEB_BEARER_TOKEN = (
    "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D"
    "1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA"
)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

# Mirrors the shared client timeouts created in app.main's lifespan so a
# standalone service instance behaves the same as one wired to app.state.
DEFAULT_TIMEOUT = httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)


class _LiveRequestError(Exception):
    """Internal marker — a live X request failed (network, auth, or parsing)."""


# ---------------------------------------------------------------------------
# Response envelope helpers
# ---------------------------------------------------------------------------

def _envelope(
    data: Any,
    *,
    status: str,
    source: str,
    reason: str | None = None,
    error: str | None = None,
) -> dict:
    """Build the uniform response envelope shared by every public method."""
    payload: dict[str, Any] = {"status": status, "source": source, "data": data}
    if reason:
        payload["fallback_reason"] = reason
    if error:
        payload["error"] = error
    return payload


def _demo_envelope(data: Any, reason: str | None = None, error: str | None = None) -> dict:
    return _envelope(data, status="demo", source="demo", reason=reason, error=error)


def _as_int(value: Any, default: int = 0) -> int:
    """Coerce JSON numbers/strings to int without ever raising."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _normalize_timestamp(raw: Any) -> str:
    """Convert X's ``Wed Sep 02 14:23:00 +0000 2026`` format to ISO-8601."""
    if not raw:
        return ""
    try:
        parsed = datetime.strptime(str(raw), "%a %b %d %H:%M:%S %z %Y")
        return parsed.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except (TypeError, ValueError):
        return str(raw)


# ---------------------------------------------------------------------------
# Live response parsers
# ---------------------------------------------------------------------------

def _parse_user(raw: dict) -> dict:
    """Normalize a v1.1 user object (users/show.json) to our profile schema."""
    raw = raw or {}
    handle = str(raw.get("screen_name") or "")
    return {
        "handle": handle,
        "name": str(raw.get("name") or handle),
        "description": str(raw.get("description") or ""),
        "followers": _as_int(raw.get("followers_count")),
        "following": _as_int(raw.get("friends_count")),
        "tweets_count": _as_int(raw.get("statuses_count")),
        "profile_image_url": str(raw.get("profile_image_url_https") or ""),
        "verified": bool(raw.get("verified")),
        "location": str(raw.get("location") or ""),
        "url": f"https://x.com/{handle}" if handle else "",
        "created_at": _normalize_timestamp(raw.get("created_at")),
    }


def _parse_tweet(raw: dict, users_by_id: dict[str, dict] | None = None) -> dict:
    """Normalize a v1.1 tweet object to our tweet schema.

    ``users_by_id`` is the ``global_objects.users`` map from adaptive search
    responses; timeline responses embed the author under ``user`` instead.
    """
    raw = raw or {}
    tweet_id = str(raw.get("id_str") or raw.get("id") or "")

    author: dict = {}
    if users_by_id:
        author = users_by_id.get(str(raw.get("user_id_str") or "")) or {}
    if not author and isinstance(raw.get("user"), dict):
        author = raw["user"]

    handle = str(author.get("screen_name") or "")
    views = 0
    ext_views = raw.get("ext_views")
    if isinstance(ext_views, dict):
        views = _as_int(ext_views.get("count"))

    return {
        "id": tweet_id,
        "text": str(raw.get("full_text") or raw.get("text") or ""),
        "author_handle": handle,
        "author_name": str(author.get("name") or handle),
        "created_at": _normalize_timestamp(raw.get("created_at")),
        "likes": _as_int(raw.get("favorite_count")),
        "retweets": _as_int(raw.get("retweet_count")),
        "replies": _as_int(raw.get("reply_count")),
        "views": views,
        "url": f"https://x.com/{handle}/status/{tweet_id}" if handle and tweet_id else "",
    }


# ---------------------------------------------------------------------------
# Demo data
# ---------------------------------------------------------------------------

_DEMO_NAMES = [
    ("Sam", "Rivera"), ("Priya", "Nair"), ("Dave", "Gray"), ("Marcus", "Webb"),
    ("Elle", "Okafor"), ("Natasha", "Kim"), ("Jonas", "Schild"), ("Ana", "Duarte"),
    ("Ben", "Torres"), ("Sofia", "Almeida"), ("Leo", "Mancini"), ("Mara", "Voss"),
]

_DEMO_AUTHORS = [
    ("growthhacksam", "Sam Rivera"),
    ("priya_builds", "Priya Nair"),
    ("davegray_ink", "Dave Gray"),
    ("marcus_growth", "Marcus Webb"),
    ("elle_ships", "Elle Okafor"),
    ("nocode_natasha", "Natasha Kim"),
    ("js_foundry", "Jonas Schild"),
    ("ana_metrics", "Ana Duarte"),
    ("buildwithben", "Ben Torres"),
    ("sofia_digital", "Sofia Almeida"),
]

_DEMO_LOCATIONS = [
    "Austin, TX", "Lisbon, Portugal", "Berlin, Germany", "Bengaluru, India",
    "London, UK", "Toronto, Canada", "New York, NY", "Remote",
]

_DEMO_BIOS = [
    "Building in public. Growth & distribution for early-stage startups.",
    "Marketing nerd turning boring products into stories people share.",
    "Founder. Failed twice, learning in public the third time around.",
    "Content strategist. I read the analytics so you don't have to.",
    "Growth engineer. Threads about systems, not hacks.",
    "Helping founders find their first 10k followers. DMs open.",
]

_DEMO_SEARCH_TEMPLATES = [
    "Hot take: {query} is the most underrated lever in growth right now. Most teams obsess over aesthetics and ignore it entirely.",
    "We tested {query} across 40 posts last month. Reach up 218%, replies up 4.1x, zero ad spend. Full breakdown in the thread.",
    "Everyone wants virality. Almost nobody studies {query} with actual discipline. The gap between the two groups is brutal.",
    "Three years of {query} taught me one thing: consistency beats cleverness every single time. Show up daily or don't complain.",
    "Unpopular opinion: {query} won't save a boring product. But paired with a great one? It's rocket fuel.",
    "Just watched a founder go from 400 to 40k followers in 6 months purely on {query}. No hacks, no paid boosts. System + patience.",
    "{query} tip that took me way too long to learn: your first line is 80% of the battle. If it doesn't stop the scroll, nothing after it matters.",
    "If you're serious about {query}, stop posting at random times and start tracking what actually lands. Data over vibes.",
    "The best {query} play I've seen this year came from a 19-year-old with 800 followers. Pay attention to small accounts.",
    "{query} in 2026: the algorithms reward genuine conversation, not broadcast. Reply more, broadcast less.",
]

_DEMO_TIMELINE_TEMPLATES = [
    "Shipped the analytics rewrite today. 3 weeks of work, 40% faster dashboards, zero downtime. Small wins compound.",
    "Your first 100 followers are friends, not an audience. Treat them like it and the next 10,000 take care of themselves.",
    "The best growth tactic nobody talks about: reply thoughtfully to 10 people in your niche every morning. Try it for 30 days.",
    "Every 'overnight success' account I've studied had 2+ years of daily posting before the spike. There is no spike without the years.",
    "Deleted 40 old posts today. Curating your profile is underrated — it's a landing page, not an archive.",
    "If your hook doesn't work, nothing after it matters. Spend half of your writing time on the first line.",
    "Growth hack of the week: turn your best-performing reply into a standalone post. The algorithm already told you it works.",
    "Somewhere right now a founder with 900 followers is writing something better than anything I'll ever post. Find those people early.",
    "Consistency isn't sexy. It's also the only thing that has ever worked for me.",
    "A month of data is in: threads get reach, single posts get replies, and DMs get clients. Allocate accordingly.",
]


def _demo_tweet(rng: random.Random, handle: str, name: str, text: str) -> dict:
    """Build a realistic tweet object (IDs are 19-digit like real snowflakes)."""
    tweet_id = str(rng.randrange(10**18, 10**19))
    created_at = datetime.now(timezone.utc) - timedelta(hours=rng.randrange(1, 96))
    return {
        "id": tweet_id,
        "text": text,
        "author_handle": handle,
        "author_name": name,
        "created_at": created_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "likes": rng.randrange(12, 5_400),
        "retweets": rng.randrange(1, 900),
        "replies": rng.randrange(0, 240),
        "views": rng.randrange(800, 210_000),
        "url": f"https://x.com/{handle}/status/{tweet_id}",
    }


def _demo_search(query: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for search_tweets — tweets that reference the query."""
    display_query = (query or "").strip() or "social media growth"
    rng = random.Random(f"x-search:{display_query}".lower())
    templates = list(_DEMO_SEARCH_TEMPLATES)
    authors = list(_DEMO_AUTHORS)
    rng.shuffle(templates)
    rng.shuffle(authors)
    tweets = [
        _demo_tweet(rng, handle, name, template.format(query=display_query))
        for template, (handle, name) in zip(templates[:8], authors)
    ]
    return _demo_envelope(
        {"query": query, "count": len(tweets), "tweets": tweets}, reason, error
    )


def _demo_user_tweets(handle: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for get_user_tweets — a plausible recent timeline."""
    handle = (handle or "user").strip().lstrip("@") or "user"
    rng = random.Random(f"x-timeline:{handle}".lower())
    templates = list(_DEMO_TIMELINE_TEMPLATES)
    rng.shuffle(templates)
    first, last = rng.choice(_DEMO_NAMES)
    tweets = [_demo_tweet(rng, handle, f"{first} {last}", template) for template in templates]
    return _demo_envelope(
        {"handle": handle, "count": len(tweets), "tweets": tweets}, reason, error
    )


def _demo_profile(handle: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for get_user_profile — a plausible account snapshot."""
    handle = (handle or "user").strip().lstrip("@") or "user"
    rng = random.Random(f"x-profile:{handle}".lower())
    first, last = rng.choice(_DEMO_NAMES)
    profile = {
        "handle": handle,
        "name": f"{first} {last}",
        "description": rng.choice(_DEMO_BIOS),
        "followers": rng.randrange(820, 148_000),
        "following": rng.randrange(80, 2_400),
        "tweets_count": rng.randrange(120, 24_000),
        "profile_image_url": (
            f"https://pbs.twimg.com/profile_images/{rng.randrange(10**8, 10**9)}/"
            f"demo_{handle[:12]}_400x400.jpg"
        ),
        "verified": rng.random() < 0.2,
        "location": rng.choice(_DEMO_LOCATIONS),
        "url": f"https://x.com/{handle}",
        "created_at": (
            datetime.now(timezone.utc) - timedelta(days=rng.randrange(400, 5_400))
        ).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    return _demo_envelope({"handle": handle, "profile": profile}, reason, error)


def _demo_dm(recipient: str, message: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for send_dm — a simulated successful delivery."""
    rng = random.Random(f"x-dm:{recipient}")
    dm = {
        "dm_id": str(rng.randrange(10**17, 10**18)),
        "recipient": recipient,
        "message": message,
        "delivered": True,
        "sent_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    return _demo_envelope(dm, reason, error)


def _demo_post(text: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for post_tweet — a simulated successful post."""
    rng = random.Random(f"x-post:{text}")
    tweet = _demo_tweet(rng, "your_handle", "You", text or "")
    data = {
        "text": text,
        "posted": True,
        "tweet": tweet,
        "url": tweet["url"],
    }
    return _demo_envelope(data, reason, error)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class XService:
    """All interactions with the X/Twitter web API, with demo fallback.

    An optional shared ``httpx.AsyncClient`` (e.g. ``app.state.http_client``
    created in the app lifespan) can be injected via the constructor; when
    omitted, the service creates and owns a default client, which
    :meth:`aclose` will clean up. Injected clients are never closed here —
    their owner (the app lifespan) is responsible for them.

    Authentication is per-user: every method accepts the ``auth_token``
    session cookie stored on the user's record and applies it per request,
    so a single service instance can act on behalf of many users.
    """

    def __init__(self, http_client: httpx.AsyncClient | None = None):
        self.settings = get_settings()
        self._client = http_client
        self._owns_client = http_client is None

    # -- client lifecycle ---------------------------------------------------

    def _get_client(self) -> httpx.AsyncClient:
        """Return the injected client, lazily creating one if needed."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=DEFAULT_TIMEOUT, follow_redirects=True
            )
            self._owns_client = True
        return self._client

    async def aclose(self) -> None:
        """Close the internal client — but never one that was injected."""
        if self._owns_client and self._client is not None and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    # -- low-level request helper --------------------------------------------

    def _headers(self, auth_token: str) -> dict[str, str]:
        """Build headers replicating an authenticated X web session."""
        # The ct0 cookie and x-csrf-token header must match each other; a
        # random value per request satisfies that contract.
        ct0 = uuid.uuid4().hex
        return {
            "authorization": f"Bearer {X_WEB_BEARER_TOKEN}",
            "user-agent": USER_AGENT,
            "accept": "application/json",
            "x-twitter-auth-type": "OAuth2Session",
            "x-twitter-active-user": "yes",
            "x-twitter-client-language": "en",
            "x-csrf-token": ct0,
            "cookie": f"auth_token={auth_token}; ct0={ct0}",
        }

    async def _request_json(
        self,
        method: str,
        path: str,
        auth_token: str,
        params: dict | None = None,
        data: dict | None = None,
        json_body: dict | None = None,
    ) -> Any:
        """Issue an authenticated X web API request and return parsed JSON.

        Raises :class:`_LiveRequestError` on any network/HTTP/parsing failure
        so callers can uniformly fall back to demo data.
        """
        client = self._get_client()
        url = f"{X_API_BASE}{path}"
        try:
            response = await client.request(
                method,
                url,
                headers=self._headers(auth_token),
                params=params,
                data=data,
                json=json_body,
            )
        except httpx.RequestError as exc:
            raise _LiveRequestError(f"network error calling {path}: {exc}") from exc

        if response.status_code in (401, 403):
            raise _LiveRequestError(
                f"X rejected the request for {path} (HTTP {response.status_code}) — "
                "the stored auth_token is likely expired or invalid"
            )
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise _LiveRequestError(f"HTTP {response.status_code} from {path}") from exc

        try:
            return response.json()
        except ValueError as exc:
            raise _LiveRequestError(f"non-JSON response from {path}") from exc

    # -- public API ----------------------------------------------------------

    async def search_tweets(self, query: str, auth_token: str | None = None) -> dict:
        """Search tweets matching ``query``."""
        query = (query or "").strip()
        try:
            if not auth_token:
                return _demo_search(query, reason="no_auth_token")
            if not query:
                return _demo_search(
                    query, reason="request_failed", error="query must not be empty"
                )

            raw = await self._request_json(
                "GET",
                "/search/adaptive.json",
                auth_token=auth_token,
                params={
                    "q": query,
                    "count": 20,
                    "query_source": "typed_query",
                    "pc": 1,
                    "spelling_corrections": 0,
                },
            )
            global_objects = (raw or {}).get("global_objects") or {}
            users_by_id = global_objects.get("users") or {}
            tweets = [
                _parse_tweet(tweet, users_by_id)
                for tweet in (global_objects.get("tweets") or {}).values()
            ]
            if not tweets:
                raise _LiveRequestError("search response contained no tweets")
            return _envelope(
                {"query": query, "count": len(tweets), "tweets": tweets},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("XService.search_tweets falling back to demo data: %s", exc)
            return _demo_search(query, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in XService.search_tweets")
            return _demo_search(query, reason="request_failed", error=str(exc))

    async def get_user_profile(self, handle: str, auth_token: str | None = None) -> dict:
        """Get profile info for ``handle``."""
        handle = (handle or "").strip().lstrip("@")
        try:
            if not auth_token:
                return _demo_profile(handle, reason="no_auth_token")
            if not handle:
                return _demo_profile(
                    handle, reason="request_failed", error="handle must not be empty"
                )

            raw = await self._request_json(
                "GET",
                "/1.1/users/show.json",
                auth_token=auth_token,
                params={"screen_name": handle},
            )
            profile = _parse_user(raw or {})
            if not profile.get("handle"):
                raise _LiveRequestError("profile response missing screen_name")
            return _envelope(
                {"handle": profile["handle"], "profile": profile},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("XService.get_user_profile falling back to demo data: %s", exc)
            return _demo_profile(handle, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in XService.get_user_profile")
            return _demo_profile(handle, reason="request_failed", error=str(exc))

    async def get_user_tweets(self, handle: str, auth_token: str | None = None) -> dict:
        """Get recent tweets from ``handle``."""
        handle = (handle or "").strip().lstrip("@")
        try:
            if not auth_token:
                return _demo_user_tweets(handle, reason="no_auth_token")
            if not handle:
                return _demo_user_tweets(
                    handle, reason="request_failed", error="handle must not be empty"
                )

            raw = await self._request_json(
                "GET",
                "/1.1/statuses/user_timeline.json",
                auth_token=auth_token,
                params={
                    "screen_name": handle,
                    "count": 20,
                    "include_rts": 1,
                    "exclude_replies": 0,
                    "tweet_mode": "extended",
                },
            )
            tweets = (
                [_parse_tweet(tweet) for tweet in raw if isinstance(tweet, dict)]
                if isinstance(raw, list)
                else []
            )
            if not tweets:
                raise _LiveRequestError("timeline response contained no tweets")
            return _envelope(
                {"handle": handle, "count": len(tweets), "tweets": tweets},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("XService.get_user_tweets falling back to demo data: %s", exc)
            return _demo_user_tweets(handle, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in XService.get_user_tweets")
            return _demo_user_tweets(handle, reason="request_failed", error=str(exc))

    async def send_dm(self, recipient: str, message: str, auth_token: str | None = None) -> dict:
        """Send a direct message to ``recipient`` (handle or numeric user id)."""
        recipient = (recipient or "").strip().lstrip("@")
        message = message or ""
        try:
            if not auth_token:
                return _demo_dm(recipient, message, reason="no_auth_token")
            if not recipient or not message:
                return _demo_dm(
                    recipient,
                    message,
                    reason="request_failed",
                    error="recipient and message must not be empty",
                )

            # Resolve the recipient to a numeric user id first.
            target = recipient
            if not target.isdigit():
                raw = await self._request_json(
                    "GET",
                    "/1.1/users/show.json",
                    auth_token=auth_token,
                    params={"screen_name": target},
                )
                target = str((raw or {}).get("id_str") or (raw or {}).get("id") or "")
                if not target or target == "None":
                    raise _LiveRequestError(
                        f"could not resolve recipient handle '{recipient}' to a user id"
                    )

            body = {
                "conversation_id": target,
                "recipient_ids": False,
                "text": message,
                "cards_platform": "Web-12",
                "include_cards": 1,
                "include_quote_count": True,
                "dm_users": False,
                "media_categories": "dm_text,dm_image,dmt_gif,dm_video,dm_share",
                "support_video_type": 1,
                "supports_cards": 1,
            }
            raw = await self._request_json(
                "POST", "/1.1/dm/new2.json", auth_token=auth_token, json_body=body
            )
            event = (raw or {}).get("event") or {}
            dm = {
                "dm_id": str(event.get("id") or event.get("id_str") or ""),
                "recipient": recipient,
                "message": message,
                "delivered": True,
                "sent_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            return _envelope(dm, status="ok", source="live")
        except _LiveRequestError as exc:
            logger.warning("XService.send_dm falling back to demo data: %s", exc)
            return _demo_dm(recipient, message, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in XService.send_dm")
            return _demo_dm(recipient, message, reason="request_failed", error=str(exc))

    async def post_tweet(self, text: str, auth_token: str | None = None) -> dict:
        """Post a tweet on behalf of the authenticated user."""
        text = text or ""
        try:
            if not auth_token:
                return _demo_post(text, reason="no_auth_token")
            if not text.strip():
                return _demo_post(
                    text, reason="request_failed", error="text must not be empty"
                )

            raw = await self._request_json(
                "POST",
                "/1.1/statuses/update.json",
                auth_token=auth_token,
                data={"status": text},
            )
            tweet = _parse_tweet(raw or {})
            return _envelope(
                {"text": text, "posted": True, "tweet": tweet, "url": tweet.get("url", "")},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("XService.post_tweet falling back to demo data: %s", exc)
            return _demo_post(text, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in XService.post_tweet")
            return _demo_post(text, reason="request_failed", error=str(exc))

    async def get_mentions(self, handle: str, auth_token: str | None = None) -> dict:
        """Fetch recent tweets mentioning ``handle`` (a scoped search)."""
        handle = (handle or "").strip().lstrip("@")
        if not handle:
            return _demo_search(
                f"@{handle}",
                reason="request_failed",
                error="handle must not be empty",
            )
        # search_tweets already guarantees a non-raising envelope.
        return await self.search_tweets(f"@{handle}", auth_token=auth_token)
