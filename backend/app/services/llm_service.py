"""LLM service (OpenAI SDK → Gemini endpoint) with graceful demo-mode fallback."""

from functools import lru_cache

from openai import AsyncOpenAI

from app.config import get_settings


class LLMService:
    """Manages LLM interactions via the OpenAI-compatible Gemini endpoint."""

    def __init__(self):
        settings = get_settings()
        self._configured = settings.gemini_configured
        self._client: AsyncOpenAI | None = None
        if self._configured:
            try:
                self._client = AsyncOpenAI(
                    api_key=settings.GEMINI_API_KEY,
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                )
            except Exception:
                # If initialisation fails, stay in demo mode.
                self._configured = False

    @property
    def is_available(self) -> bool:
        """Return True when a real LLM client is ready to use."""
        return self._configured and self._client is not None

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        agent_name: str = "General",
    ) -> dict:
        """Generate content using the LLM, falling back to a demo response."""
        if not self.is_available:
            return {
                "status": "demo",
                "agent": agent_name,
                "message": "LLM not configured — returning demo response",
                "content": (
                    f"[Demo] This is a placeholder response from {agent_name}. "
                    "Configure GEMINI_API_KEY to enable real AI generation."
                ),
            }
        try:
            response = await self._client.chat.completions.create(
                model="gemini-2.0-flash",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            return {
                "status": "success",
                "agent": agent_name,
                "content": response.choices[0].message.content,
            }
        except Exception as exc:
            return {
                "status": "error",
                "agent": agent_name,
                "message": str(exc),
                "content": f"[Error] {agent_name} encountered an issue. Please try again.",
            }


@lru_cache
def get_llm_service() -> LLMService:
    """Return a cached singleton LLMService instance."""
    return LLMService()
