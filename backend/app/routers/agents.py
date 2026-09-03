"""Agent endpoints: listing, execution, and capabilities."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app import auth_utils
from app.agents.agent_executor import get_agent_executor
from app.agents.swarm import AGENTS, AGENTS_BY_ID
from app.models.user import User
from app.services.llm_service import get_llm_service

router = APIRouter(tags=["agents"])


# ── Request / Response schemas ────────────────────────────────────────────── #

class AgentExecuteRequest(BaseModel):
    agent_id: str = Field(
        ..., description="Agent identifier, e.g. 'signal-hunter'"
    )
    input: str = Field(..., description="The task input for the agent")


# ── Helpers ────────────────────────────────────────────────────────────────── #

def _build_linked_account_context(user: User) -> str:
    """
    Summarise the current user's linked X/LinkedIn accounts as agent context.

    Raw tokens (x_auth_token, linkedin_li_at) are deliberately NOT included
    — only their presence as connection status, plus the public identifiers
    (X handle / LinkedIn profile URL). This mirrors the token-free
    LinkedAccountsResponse pattern used by the settings router and keeps
    credentials out of LLM prompts.
    """
    x_connected = bool(user.x_auth_token)
    linkedin_connected = bool(user.linkedin_li_at)

    lines = ["User's linked accounts:"]

    if user.x_handle or x_connected:
        handle = (user.x_handle or "(handle not set)").lstrip("@")
        state = "connected" if x_connected else "not authenticated (token missing)"
        lines.append(f"- X (Twitter): @{handle} — {state}")
    else:
        lines.append("- X (Twitter): not connected")

    if user.linkedin_profile_url or linkedin_connected:
        url = user.linkedin_profile_url or "(profile URL not set)"
        state = (
            "connected" if linkedin_connected
            else "not authenticated (session token missing)"
        )
        lines.append(f"- LinkedIn: {url} — {state}")
    else:
        lines.append("- LinkedIn: not connected")

    return "\n".join(lines)


# ── Endpoints ──────────────────────────────────────────────────────────────── #

@router.get("/", response_model=dict)
async def list_agents(
    current_user: User = Depends(auth_utils.get_current_user),
):
    """Return the full roster of 16 B2B sales agents with IDs."""
    return {
        "agents": [
            {
                "id": a["id"],
                "name": a["name"],
                "description": a["description"],
                "capabilities": a["capabilities"],
                "status": a["status"],
            }
            for a in AGENTS
        ]
    }


@router.get("/status", response_model=dict)
async def agents_status(
    current_user: User = Depends(auth_utils.get_current_user),
):
    """Runtime status of all agents."""
    return {
        "agents": [
            {"id": a["id"], "name": a["name"], "status": a["status"]}
            for a in AGENTS
        ]
    }


@router.post("/execute", response_model=dict)
async def execute_agent(
    request: AgentExecuteRequest,
    current_user: User = Depends(auth_utils.get_current_user),
):
    """
    Execute a specific B2B sales agent task.

    The agent uses AI when configured, otherwise returns a demo response.
    The current user's linked X/LinkedIn account status is loaded from the
    user record and injected into the agent's user prompt as context, so
    agents know which platforms they can actually operate on the user's
    behalf.
    """
    agent = AGENTS_BY_ID.get(request.agent_id)
    if not agent:
        raise HTTPException(
            status_code=404, detail=f"Unknown agent: {request.agent_id}"
        )

    context = _build_linked_account_context(current_user)
    executor = get_agent_executor()
    return await executor.execute(
        agent_id=request.agent_id,
        user_input=request.input,
        context=context,
    )


@router.get("/capabilities", response_model=dict)
async def agents_capabilities(
    current_user: User = Depends(auth_utils.get_current_user),
):
    """
    Return each agent with their capabilities and AI availability.
    """
    llm = get_llm_service()
    return {
        "ai_available": llm.is_available,
        "mode": "llm" if llm.is_available else "demo",
        "agents": [
            {
                "id": a["id"],
                "name": a["name"],
                "capabilities": a["capabilities"],
            }
            for a in AGENTS
        ],
    }
