from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import json
import models
from database import engine, get_db
from agent import app as agent_app
from langchain_core.messages import HumanMessage, AIMessage
from utils import extract_text_from_pdf

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zenith AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Zenith AI API is running"}

@app.post("/chat")
async def chat(
    message: str = Form(...),
    mode: str = Form("guardian"),
    tasks_json: str = Form("[]"),
    resume_text: str = Form(""),
    session_id: str = Form("default"),
    db: Session = Depends(get_db)
):
    tasks = json.loads(tasks_json)
    
    # Save user message to DB
    user_msg = models.ChatHistory(session_id=session_id, role="human", content=message)
    db.add(user_msg)
    db.commit()

    # Get history from DB for the agent
    history_records = db.query(models.ChatHistory).filter(models.ChatHistory.session_id == session_id).all()
    history = []
    for rec in history_records:
        if rec.role == "human":
            history.append(HumanMessage(content=rec.content))
        else:
            history.append(AIMessage(content=rec.content))

    # Run the agent
    initial_state = {
        "mode": mode,
        "tasks": tasks,
        "resume_text": resume_text,
        "messages": history,
        "current_negotiation": None
    }
    
    result = agent_app.invoke(initial_state)
    last_msg = result["messages"][-1]
    
    # Save AI response to DB
    ai_msg = models.ChatHistory(session_id=session_id, role="ai", content=last_msg.content)
    db.add(ai_msg)
    db.commit()
    
    return {"response": last_msg.content, "state": {
        "mode": result["mode"],
        "tasks": result["tasks"],
        "current_negotiation": result["current_negotiation"]
    }}

@app.get("/history/{session_id}")
async def get_history(session_id: str, db: Session = Depends(get_db)):
    history = db.query(models.ChatHistory).filter(models.ChatHistory.session_id == session_id).all()
    return history

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    text = extract_text_from_pdf(contents)
    return {"text": text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
