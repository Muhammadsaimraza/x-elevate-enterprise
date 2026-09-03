from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websockets"])


@router.websocket("/chat")
async def websocket_chat(websocket: WebSocket):
    """Placeholder WebSocket endpoint for real-time agent chat."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({
                "type": "echo",
                "message": f"Received: {data}",
                "note": "WebSocket handler — not yet implemented",
            })
    except WebSocketDisconnect:
        pass
