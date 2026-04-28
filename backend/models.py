from sqlalchemy import Column, Integer, String, DateTime, JSON, Text
from database import Base
import datetime

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String) # 'human' or 'ai'
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class UserTask(Base):
    __tablename__ = "user_tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    status = Column(String)
    deadline = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
