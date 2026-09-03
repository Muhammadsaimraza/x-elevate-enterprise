"""LinkedIn API service.

Real integration performs httpx calls against LinkedIn's internal Voyager
REST API (``https://www.linkedin.com/voyager/api/...``), authenticating with
the per-user ``li_at`` session cookie stored on the User model
(``users.linkedin_li_at``). A random ``JSESSIONID`` is generated per request
and mirrored into the ``csrf-token`` header, matching the cookie/header CSRF
contract the Voyager API enforces.

Every public method returns the same response envelope (identical to
``XService``)::

    {
        "status": "ok" | "demo",          # "ok" = live call succeeded
        "source": "live" | "demo",
        "data": {...},                    # method-specific payload
        "fallback_reason": "no_li_at" | "request_failed",  # demo only
        "error": "...",                   # demo-after-failure only
    }

When no ``li_at`` cookie is supplied — or a live request fails for any reason
(network error, expired session, bot challenge, unexpected response shape) —
the method falls back to structured demo data so agent flows never crash and
always receive a payload matching the expected schema.

Voyager endpoints are private and change without notice; any failure simply
triggers the demo fallback described above.
"""

import logging
import random
import re
from datetime import datetime, timezone
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# LinkedIn Voyager API constants
# ---------------------------------------------------------------------------

VOYAGER_API_BASE = "https://www.linkedin.com/voyager/api"

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
)

# Mirrors the shared client timeouts created in app.main's lifespan so a
# standalone service instance behaves the same as one wired to app.state.
DEFAULT_TIMEOUT = httpx.Timeout(connect=5.0, read=30.0, write=10.0, pool=5.0)


class _LiveRequestError(Exception):
    """Internal marker — a live Voyager request failed (network, auth, or parsing)."""


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


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")
    return slug or "member"


# ---------------------------------------------------------------------------
# URL parsing helpers
# ---------------------------------------------------------------------------

def _profile_slug_from_url(profile_url: str) -> str:
    """Extract the public identifier from a LinkedIn profile URL.

    Handles ``https://www.linkedin.com/in/jane-doe-123/``, query/hash
    suffixes, sales-navigator URLs, and a bare ``jane-doe-123`` slug.
    """
    if not profile_url:
        return ""
    value = profile_url.strip()
    match = re.search(r"/in/([^/?#\s]+)", value)
    if match:
        return match.group(1)
    # A bare slug was provided.
    value = value.split("?", 1)[0].split("#", 1)[0].strip("/")
    if value and "/" not in value and not value.startswith("urn:"):
        return value
    return ""


def _company_slug_from_url(url: str) -> str:
    """Extract the company slug (or numeric organization id) from a URL."""
    if not url:
        return ""
    value = url.strip()
    match = re.search(r"/sales/company/(\d+)", value)
    if match:
        return match.group(1)
    match = re.search(r"/(?:company|school|showcase)/([^/?#\s]+)", value, re.IGNORECASE)
    if match:
        return match.group(1)
    # A bare slug was provided.
    value = value.split("?", 1)[0].split("#", 1)[0].strip("/")
    if value and "/" not in value:
        return value
    return ""


def _jsessionid() -> str:
    """Random JSESSIONID in the ``ajax:<digits>`` shape the web client uses."""
    digits = "".join(random.choice("0123456789") for _ in range(19))
    return f"ajax:{digits}"


# ---------------------------------------------------------------------------
# Live response parsers (Voyager "normalized JSON" responses)
# ---------------------------------------------------------------------------

def _find_included(payload: dict, type_fragment: str) -> dict:
    """Return the first entity in a Voyager ``included`` list whose ``$type``
    contains ``type_fragment`` (e.g. ``identity.profile.Profile``)."""
    for entity in (payload or {}).get("included") or []:
        if isinstance(entity, dict) and type_fragment in str(entity.get("$type") or ""):
            return entity
    return {}


def _profile_entity(payload: dict) -> dict:
    """Locate the Profile entity in a Voyager response (legacy or dash)."""
    entity = _find_included(payload, "identity.profile.Profile")
    if not entity:
        data = (payload or {}).get("data") or {}
        if isinstance(data, dict) and ("firstName" in data or "publicIdentifier" in data):
            entity = data
    return entity


def _company_entity(payload: dict) -> dict:
    """Locate the Company entity in a Voyager response (legacy or dash)."""
    for fragment in ("organization.Company", "company.Company"):
        entity = _find_included(payload, fragment)
        if entity:
            return entity
    data = (payload or {}).get("data") or {}
    if isinstance(data, dict):
        if "name" in data or "universalName" in data:
            return data
        elements = data.get("elements") or data.get("*elements")
        if isinstance(elements, list) and elements and isinstance(elements[0], dict):
            return elements[0]
    return {}


def _extract_photo(entity: dict) -> str:
    """Best-effort extraction of a profile photo URL from a Profile entity."""
    picture = entity.get("profilePicture") or {}
    if not isinstance(picture, dict):
        return ""
    display = picture.get("displayImageReference") or picture.get("displayImage") or {}
    if isinstance(display, str):
        return display
    vector = display.get("vectorImage") or {} if isinstance(display, dict) else {}
    root = vector.get("rootUrl") or ""
    artifacts = vector.get("artifacts") or []
    if root and artifacts and isinstance(artifacts[-1], dict):
        return root + artifacts[-1].get("fileIdentifyingUrlPathSegment", "")
    return ""


def _extract_logo(entity: dict) -> str:
    """Best-effort extraction of a logo URL from a Company entity."""
    logo = entity.get("logo") or {}
    if not isinstance(logo, dict):
        return ""
    root = logo.get("rootUrl") or ""
    artifacts = logo.get("artifacts") or []
    if root and artifacts and isinstance(artifacts[0], dict):
        return root + artifacts[0].get("fileIdentifyingUrlPathSegment", "")
    url = logo.get("url")
    return url if isinstance(url, str) else ""


def _extract_headquarters(entity: dict) -> str:
    """Build a human-readable "City, Country" from a Company entity."""
    hq = entity.get("headquarters") or {}
    if isinstance(hq, list):
        hq = hq[0] if hq else {}
    if not isinstance(hq, dict):
        return ""
    parts = [str(hq.get(key) or "") for key in ("city", "geographicArea", "country")]
    parts = [part for part in parts if part]
    return ", ".join(dict.fromkeys(parts))


def _parse_profile(entity: dict, payload: dict, slug: str) -> dict:
    """Normalize a Voyager Profile entity to our profile schema."""
    entity = entity or {}
    first = str(entity.get("firstName") or "")
    last = str(entity.get("lastName") or "")
    identifier = str(entity.get("publicIdentifier") or slug)
    return {
        "public_identifier": identifier,
        "full_name": f"{first} {last}".strip(),
        "headline": str(entity.get("headline") or ""),
        "location": str(entity.get("locationName") or ""),
        "num_connections": _as_int(entity.get("numConnections")),
        "profile_url": f"https://www.linkedin.com/in/{identifier}",
        "photo_url": _extract_photo(entity),
        "current_title": str(entity.get("occupation") or ""),
        "urn": str(entity.get("entityUrn") or ""),
    }


def _parse_people_search(payload: dict) -> list[dict]:
    """Extract person results from a blended search response."""
    people: list[dict] = []
    data = (payload or {}).get("data") or {}
    for cluster in data.get("elements") or []:
        if not isinstance(cluster, dict):
            continue
        if "PEOPLE" not in str(cluster.get("template") or "").upper():
            continue
        for element in cluster.get("elements") or []:
            if not isinstance(element, dict):
                continue
            nav_url = str(element.get("navigationUrl") or "")
            slug_match = re.search(r"/in/([^/?#]+)", nav_url)
            slug = slug_match.group(1) if slug_match else ""
            people.append({
                "public_identifier": slug,
                "full_name": str((element.get("title") or {}).get("text") or ""),
                "headline": str((element.get("subtitle") or {}).get("text") or ""),
                "social_proof": str(element.get("socialProofText") or ""),
                "profile_url": f"https://www.linkedin.com/in/{slug}" if slug else nav_url,
                "urn": str(element.get("trackingUrn") or ""),
            })
    return people


def _parse_company(entity: dict, slug: str) -> dict:
    """Normalize a Voyager Company entity to our company schema."""
    entity = entity or {}
    industry = entity.get("industry") or ""
    if isinstance(industry, list):
        industry = ", ".join(str(item) for item in industry)
    universal_name = str(entity.get("universalName") or slug)
    return {
        "name": str(entity.get("name") or universal_name),
        "universal_name": universal_name,
        "description": str(entity.get("description") or ""),
        "staff_count": _as_int(entity.get("staffCount")),
        "industry": str(industry),
        "headquarters": _extract_headquarters(entity),
        "website": str(entity.get("website") or entity.get("companyPageUrl") or ""),
        "url": f"https://www.linkedin.com/company/{universal_name}",
        "logo_url": _extract_logo(entity),
        "urn": str(entity.get("entityUrn") or ""),
    }


def _member_urn(payload: Any) -> str:
    """Best-effort extraction of the authenticated member's posting URN."""
    if not isinstance(payload, dict):
        return ""
    for entity in payload.get("included") or []:
        if not isinstance(entity, dict):
            continue
        urn = str(entity.get("entityUrn") or "")
        if urn.startswith("urn:li:fs_miniProfile:"):
            return urn.replace("urn:li:fs_miniProfile:", "urn:li:person:", 1)
        if "fsd_profile" in urn:
            return urn
    data = payload.get("data")
    if isinstance(data, dict):
        urn = str(data.get("entityUrn") or "")
        if urn:
            return urn
        plain_id = data.get("plainId")
        if plain_id:
            return f"urn:li:member:{plain_id}"
    plain_id = payload.get("plainId")
    if plain_id:
        return f"urn:li:member:{plain_id}"
    return ""


# ---------------------------------------------------------------------------
# Demo data
# ---------------------------------------------------------------------------

_LI_DEMO_NAMES = [
    ("Jordan", "Reyes"), ("Amara", "Osei"), ("Wei", "Chen"), ("Marta", "Kowalska"),
    ("Daniel", "Fischer"), ("Yuki", "Tanaka"), ("Isabel", "Moreau"), ("Omar", "Haddad"),
    ("Rachel", "Stein"), ("Diego", "Navarro"), ("Freya", "Lindqvist"), ("Aisha", "Rahman"),
]

_LI_DEMO_LOCATIONS = [
    "Austin, Texas", "Lisbon, Portugal", "Berlin, Germany", "Bengaluru, India",
    "London, United Kingdom", "Toronto, Ontario", "New York, New York", "Amsterdam, Netherlands",
]

_LI_DEMO_COMPANIES = [
    "Northwind Analytics", "Streamline", "Lumen Labs", "Driftwell",
    "Orbit", "Brightpath", "Fable", "Kernel & Co",
]

_LI_DEMO_HEADLINES = [
    "Senior Product Marketing Manager at Northwind Analytics",
    "Growth Lead at Streamline • Ex-Shopify • B2B SaaS",
    "Founder & CEO at Lumen Labs — building calm software",
    "Head of Content at Driftwell | SaaS growth writer",
    "Full-Stack Engineer building AI agents in public",
    "Demand Gen Manager at Orbit | LinkedIn ads specialist",
    "Product Designer at Fable. Previously at Automattic.",
    "Marketing Operations Lead at Brightpath, martech stack nerd",
]

_LI_DEMO_INDUSTRIES = [
    "Software Development", "Marketing & Advertising", "Financial Services",
    "Information Technology", "Professional Training & Coaching", "Design Services",
]

_LI_DEMO_COMPANY_DESCRIPTIONS = [
    "We help teams turn scattered data into decisions. Analytics infrastructure for modern growth teams.",
    "Building calm software for busy operators. Backed by founders who have been there.",
    "AI-native workflow automation for revenue teams. Less busywork, more closing.",
    "The all-in-one content engine for B2B brands. Plan, create, and measure in one place.",
    "Developer-first observability platform. Trusted by 4,000+ engineering teams.",
]

_LI_DEMO_URN_ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"


def _demo_urn(rng: random.Random, kind: str) -> str:
    """Deterministic fake URN, e.g. ``urn:li:fsd_profile:Ab3xY...``."""
    body = "".join(rng.choices(_LI_DEMO_URN_ALPHABET, k=22))
    return f"urn:li:{kind}:{body}"


def _demo_profile(profile_url: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for get_profile — a plausible member snapshot."""
    slug = _profile_slug_from_url(profile_url or "") or "jordan-reyes"
    rng = random.Random(f"li-profile:{slug}".lower())
    first, last = rng.choice(_LI_DEMO_NAMES)
    headline = rng.choice(_LI_DEMO_HEADLINES)
    profile = {
        "public_identifier": slug,
        "full_name": f"{first} {last}",
        "headline": headline,
        "location": rng.choice(_LI_DEMO_LOCATIONS),
        "num_connections": rng.randrange(300, 9_800),
        "profile_url": f"https://www.linkedin.com/in/{slug}",
        "photo_url": "",
        "current_title": re.split(r"\s+(?:at|@|\|)\s+", headline, maxsplit=1)[0],
        "urn": _demo_urn(rng, "fsd_profile"),
    }
    return _demo_envelope(
        {"profile_url": profile["profile_url"], "profile": profile}, reason, error
    )


def _demo_search_people(query: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for search_people — results themed around the query."""
    domain = (query or "").strip() or "Growth"
    rng = random.Random(f"li-search:{domain}".lower())
    results = []
    for _ in range(rng.randrange(6, 9)):
        first, last = rng.choice(_LI_DEMO_NAMES)
        slug = _slugify(f"{first} {last}")
        if rng.random() < 0.35:
            slug += f"-{rng.randrange(1, 999)}"
        results.append({
            "public_identifier": slug,
            "full_name": f"{first} {last}",
            "headline": (
                f"{rng.choice(['Senior', 'Lead', 'Head of', 'Director of', ''])} "
                f"{domain} at {rng.choice(_LI_DEMO_COMPANIES)}".strip()
            ),
            "social_proof": rng.choice(
                ["500+ connections", "300+ connections", "1,000+ connections", "2,000+ connections"]
            ),
            "profile_url": f"https://www.linkedin.com/in/{slug}",
            "urn": _demo_urn(rng, "fsd_profile"),
        })
    return _demo_envelope(
        {"query": query, "count": len(results), "people": results}, reason, error
    )


def _demo_company(url: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for get_company — a plausible organization snapshot."""
    slug = _company_slug_from_url(url or "") or "northwind-analytics"
    rng = random.Random(f"li-company:{slug}".lower())
    company = {
        "name": slug.replace("-", " ").title(),
        "universal_name": slug,
        "description": rng.choice(_LI_DEMO_COMPANY_DESCRIPTIONS),
        "staff_count": rng.randrange(11, 4_200),
        "industry": rng.choice(_LI_DEMO_INDUSTRIES),
        "headquarters": rng.choice(_LI_DEMO_LOCATIONS),
        "website": f"https://www.{slug.replace('-', '')}.com",
        "url": f"https://www.linkedin.com/company/{slug}",
        "logo_url": "",
        "urn": _demo_urn(rng, "fsd_company"),
    }
    return _demo_envelope({"url": url, "company": company}, reason, error)


def _demo_message(recipient: str, message: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for send_message — a simulated successful delivery."""
    rng = random.Random(f"li-msg:{recipient}")
    data = {
        "conversation_urn": f"urn:li:messagingConversation:({rng.randrange(10**9, 10**10)},{rng.randrange(10**9, 10**10)})",
        "recipient": recipient,
        "message": message,
        "delivered": True,
        "sent_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    return _demo_envelope(data, reason, error)


def _demo_post(text: str, reason: str | None = None, error: str | None = None) -> dict:
    """Demo payload for create_post — a simulated successful share."""
    rng = random.Random(f"li-post:{text}")
    share_id = "".join(rng.choices(_LI_DEMO_URN_ALPHABET, k=19))
    data = {
        "text": text,
        "posted": True,
        "post_urn": f"urn:li:share:{share_id}",
        "post_url": f"https://www.linkedin.com/feed/update/urn:li:share:{share_id}",
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    return _demo_envelope(data, reason, error)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class LinkedInService:
    """All interactions with the LinkedIn Voyager API, with demo fallback.

    An optional shared ``httpx.AsyncClient`` (e.g. ``app.state.http_client``
    created in the app lifespan) can be injected via the constructor; when
    omitted, the service creates and owns a default client, which
    :meth:`aclose` will clean up. Injected clients are never closed here —
    their owner (the app lifespan) is responsible for them.

    Authentication is per-user: every method accepts the ``li_at`` session
    cookie stored on the user's record and applies it per request, so a
    single service instance can act on behalf of many users.
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

    def _headers(self, li_at: str) -> dict[str, str]:
        """Build headers replicating an authenticated LinkedIn web session."""
        # The csrf-token header must match the JSESSIONID cookie; a random
        # "ajax:<digits>" value per request satisfies that contract.
        jsessionid = _jsessionid()
        return {
            "user-agent": USER_AGENT,
            "accept": "application/vnd.linkedin.normalized+json+2.1",
            "x-restli-protocol-version": "2.0.0",
            "csrf-token": jsessionid,
            "cookie": f'li_at={li_at}; JSESSIONID="{jsessionid}"',
        }

    async def _request_json(
        self,
        method: str,
        path: str,
        li_at: str,
        params: dict | None = None,
        json_body: dict | None = None,
    ) -> Any:
        """Issue an authenticated Voyager request and return parsed JSON.

        Raises :class:`_LiveRequestError` on any network/HTTP/parsing failure
        so callers can uniformly fall back to demo data.
        """
        client = self._get_client()
        url = f"{VOYAGER_API_BASE}{path}"
        try:
            response = await client.request(
                method,
                url,
                headers=self._headers(li_at),
                params=params,
                json=json_body,
            )
        except httpx.RequestError as exc:
            raise _LiveRequestError(f"network error calling {path}: {exc}") from exc

        # 999 is LinkedIn's legacy bot-check / auth-failure status code.
        if response.status_code in (401, 403, 429, 999):
            raise _LiveRequestError(
                f"LinkedIn rejected the request for {path} (HTTP {response.status_code}) — "
                "the stored li_at cookie may be expired, rate-limited, or challenged"
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

    async def get_profile(self, profile_url: str, li_at: str | None = None) -> dict:
        """Get LinkedIn profile data for ``profile_url`` (or a bare slug)."""
        try:
            if not li_at:
                return _demo_profile(profile_url, reason="no_li_at")
            slug = _profile_slug_from_url(profile_url or "")
            if not slug:
                return _demo_profile(
                    profile_url,
                    reason="request_failed",
                    error="could not parse a profile identifier from profile_url",
                )

            raw = await self._request_json(
                "GET", f"/identity/profiles/{slug}", li_at=li_at
            )
            entity = _profile_entity(raw or {})
            if not entity:
                raise _LiveRequestError("profile response contained no profile entity")
            profile = _parse_profile(entity, raw or {}, slug)
            return _envelope(
                {"profile_url": profile["profile_url"], "profile": profile},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("LinkedInService.get_profile falling back to demo data: %s", exc)
            return _demo_profile(profile_url, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in LinkedInService.get_profile")
            return _demo_profile(profile_url, reason="request_failed", error=str(exc))

    async def search_people(self, query: str, li_at: str | None = None) -> dict:
        """Search people on LinkedIn matching ``query``."""
        query = (query or "").strip()
        try:
            if not li_at:
                return _demo_search_people(query, reason="no_li_at")
            if not query:
                return _demo_search_people(
                    query, reason="request_failed", error="query must not be empty"
                )

            raw = await self._request_json(
                "GET",
                "/search/blended",
                li_at=li_at,
                params={
                    "keywords": query,
                    "origin": "GLOBAL_SEARCH_HEADER",
                    "q": "keyword",
                    "start": 0,
                    "count": 10,
                },
            )
            people = _parse_people_search(raw or {})
            if not people:
                raise _LiveRequestError("search response contained no people results")
            return _envelope(
                {"query": query, "count": len(people), "people": people},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("LinkedInService.search_people falling back to demo data: %s", exc)
            return _demo_search_people(query, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in LinkedInService.search_people")
            return _demo_search_people(query, reason="request_failed", error=str(exc))

    async def get_company(self, url: str, li_at: str | None = None) -> dict:
        """Get LinkedIn company info for ``url`` (slug, URL, or numeric id)."""
        try:
            if not li_at:
                return _demo_company(url, reason="no_li_at")
            slug = _company_slug_from_url(url or "")
            if not slug:
                return _demo_company(
                    url,
                    reason="request_failed",
                    error="could not parse a company identifier from url",
                )

            if slug.isdigit():
                # Numeric LinkedIn organization id.
                raw = await self._request_json(
                    "GET", f"/organizations/{slug}", li_at=li_at
                )
            else:
                # Resolve by universal name (company URL slug).
                raw = await self._request_json(
                    "GET",
                    "/organizations/companies",
                    li_at=li_at,
                    params={"q": "universalName", "universalName": slug},
                )
            entity = _company_entity(raw or {})
            if not entity:
                raise _LiveRequestError("company response contained no company entity")
            company = _parse_company(entity, slug)
            return _envelope(
                {"url": company["url"], "company": company},
                status="ok",
                source="live",
            )
        except _LiveRequestError as exc:
            logger.warning("LinkedInService.get_company falling back to demo data: %s", exc)
            return _demo_company(url, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in LinkedInService.get_company")
            return _demo_company(url, reason="request_failed", error=str(exc))

    async def send_message(self, recipient: str, message: str, li_at: str | None = None) -> dict:
        """Send a LinkedIn message to ``recipient`` (profile URL, slug, or URN)."""
        recipient = (recipient or "").strip()
        message = message or ""
        try:
            if not li_at:
                return _demo_message(recipient, message, reason="no_li_at")
            if not recipient or not message:
                return _demo_message(
                    recipient,
                    message,
                    reason="request_failed",
                    error="recipient and message must not be empty",
                )

            # Resolve the recipient to a profile URN first.
            if recipient.startswith("urn:"):
                profile_urn = recipient
            else:
                slug = _profile_slug_from_url(recipient)
                if not slug:
                    return _demo_message(
                        recipient,
                        message,
                        reason="request_failed",
                        error="could not parse a profile identifier from recipient",
                    )
                raw = await self._request_json(
                    "GET", f"/identity/profiles/{slug}", li_at=li_at
                )
                entity = _profile_entity(raw or {})
                profile_urn = str(entity.get("entityUrn") or "")
                if not profile_urn:
                    raise _LiveRequestError(
                        f"could not resolve a profile URN for '{slug}'"
                    )

            # Create (or reuse) a conversation with the recipient and send.
            body = {
                "recipients": [profile_urn],
                "eventCreate": {"value": {"suggestedMessage": {"text": message}}},
            }
            raw = await self._request_json(
                "POST", "/messaging/conversations", li_at=li_at, json_body=body
            )
            conversation_urn = (
                str(((raw or {}).get("data") or {}).get("entityUrn") or "")
                or _find_included(raw or {}, "messagingConversation").get("entityUrn", "")
            )
            data = {
                "conversation_urn": conversation_urn,
                "recipient": recipient,
                "message": message,
                "delivered": True,
                "sent_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            return _envelope(data, status="ok", source="live")
        except _LiveRequestError as exc:
            logger.warning("LinkedInService.send_message falling back to demo data: %s", exc)
            return _demo_message(recipient, message, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in LinkedInService.send_message")
            return _demo_message(recipient, message, reason="request_failed", error=str(exc))

    async def create_post(self, text: str, li_at: str | None = None) -> dict:
        """Create a LinkedIn share (post) on behalf of the authenticated user."""
        text = text or ""
        try:
            if not li_at:
                return _demo_post(text, reason="no_li_at")
            if not text.strip():
                return _demo_post(
                    text, reason="request_failed", error="text must not be empty"
                )

            # Resolve the authenticated member's URN for the author field.
            me = await self._request_json("GET", "/me", li_at=li_at)
            author_urn = _member_urn(me)
            if not author_urn:
                raise _LiveRequestError(
                    "could not resolve the authenticated member's URN"
                )

            body = {
                "author": author_urn,
                "commentary": text,
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionTiers": [],
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": False,
            }
            raw = await self._request_json(
                "POST", "/feed/shares", li_at=li_at, json_body=body
            )
            raw = raw or {}
            post_urn = str(raw.get("id") or raw.get("postUrn") or "")
            data = {
                "text": text,
                "posted": True,
                "post_urn": post_urn,
                "post_url": str(raw.get("postUrl") or ""),
                "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
            return _envelope(data, status="ok", source="live")
        except _LiveRequestError as exc:
            logger.warning("LinkedInService.create_post falling back to demo data: %s", exc)
            return _demo_post(text, reason="request_failed", error=str(exc))
        except Exception as exc:  # safety net — never crash a caller
            logger.exception("Unexpected error in LinkedInService.create_post")
            return _demo_post(text, reason="request_failed", error=str(exc))
