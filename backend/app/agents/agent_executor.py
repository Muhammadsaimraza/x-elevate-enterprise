"""Maps each of the 16 B2B sales agents to their LLM system prompts."""

from app.agents.swarm import AGENT_DEFINITIONS
from app.services.llm_service import LLMService, get_llm_service

# Agent-ID → system-prompt mapping for the 16 B2B sales specialists.
# Derived from AGENT_DEFINITIONS so the keys always match the agent IDs
# declared in swarm.py (head-of-sales, signal-hunter, icp-analyst, ...).
AGENT_PROMPTS: dict[str, str] = {
    agent["id"]: agent["system_prompt"] for agent in AGENT_DEFINITIONS
}


class AgentExecutor:
    """Executes agent tasks using the LLM service."""

    def __init__(self, llm_service: LLMService | None = None):
        self.llm = llm_service or get_llm_service()

    async def execute(
        self,
        agent_id: str,
        user_input: str,
        context: str | None = None,
    ) -> dict:
        """Execute a specific agent's task via the LLM.

        The agent's system prompt (looked up by ID in AGENT_PROMPTS) is
        passed to the LLM as `system_prompt`; the user's input — optionally
        enriched with caller-provided context (e.g. the user's linked
        X/LinkedIn account status) — is passed as `user_prompt`.
        """
        system_prompt = AGENT_PROMPTS.get(agent_id)
        if not system_prompt:
            return {"status": "error", "message": f"Unknown agent: {agent_id}"}

        user_prompt = user_input
        if context:
            user_prompt = (
                f"{user_input}\n\n"
                "--- Context (provided by the platform) ---\n"
                f"{context}"
            )

        return await self.llm.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            agent_name=agent_id,
        )


def get_agent_executor() -> AgentExecutor:
    """Factory for AgentExecutor wired to the singleton LLMService."""
    return AgentExecutor(get_llm_service())
