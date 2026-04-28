import operator
from typing import Annotated, List, TypedDict, Union
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, END
import os
from dotenv import load_dotenv

load_dotenv()

# Define the state for Zenith AI
class AgentState(TypedDict):
    mode: str # "guardian" or "oasis"
    tasks: List[dict]
    resume_text: str
    messages: Annotated[List[BaseMessage], operator.add]
    current_negotiation: Union[str, None]

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

# --- GOAL GUARDIAN NODES ---
def evaluator(state: AgentState):
    overdue_tasks = [t for t in state["tasks"] if t.get("status") == "overdue"]
    if overdue_tasks:
        task_name = overdue_tasks[0]["name"]
        return {"current_negotiation": task_name, "messages": [AIMessage(content=f"I noticed you missed the deadline for '{task_name}'. Is everything okay? Do we need to reschedule?")]}
    return {"current_negotiation": None}

def negotiator(state: AgentState):
    response = llm.invoke([
        SystemMessage(content=f"You are the Goal Guardian. You are helping the user reschedule the task: {state['current_negotiation']}. Be supportive but firm."),
        *state["messages"]
    ])
    return {"messages": [response]}

def general_chat(state: AgentState):
    """Handles normal conversation with a more engaging personality."""
    tasks_str = "\n".join([f"- {t['name']} (Status: {t['status']}, Deadline: {t['deadline']})" for t in state["tasks"]])
    
    system_prompt = f"""You are Zenith, a highly intelligent and supportive Career & Productivity Coach.
    
    Current Task Context:
    {tasks_str if tasks_str else "The user hasn't added any tasks yet. Encourage them to start by adding their first goal!"}
    
    Your goal is to be a proactive partner. 
    - If they say 'hi', greet them warmly and ask how their progress is going on their specific tasks.
    - If they provide gibberish or short text, kindly guide them back to how you can help (interview prep or task management).
    - Always maintain a professional yet friendly 'Silicon Valley' mentor persona.
    - Keep responses meaningful but avoid being overly wordy."""
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        *state["messages"]
    ])
    return {"messages": [response]}

# --- INTERVIEW OASIS NODES ---
def interviewer(state: AgentState):
    system_prompt = f"""You are a professional technical recruiter. 
    You are conducting a mock interview for the following candidate based on their resume:
    {state['resume_text'][:2000]}
    
    Start by introducing yourself and asking a relevant opening question. 
    Keep responses concise to simulate a real-time voice conversation."""
    
    response = llm.invoke([
        SystemMessage(content=system_prompt),
        *state["messages"]
    ])
    return {"messages": [response]}

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("evaluator", evaluator)
workflow.add_node("negotiator", negotiator)
workflow.add_node("interviewer", interviewer)
workflow.add_node("general_chat", general_chat)

workflow.set_entry_point("evaluator")

def router(state: AgentState):
    if state["mode"] == "oasis":
        return "interviewer"
    if state["current_negotiation"]:
        return "negotiator"
    return "general_chat"

workflow.add_conditional_edges("evaluator", router)
workflow.add_edge("negotiator", END)
workflow.add_edge("interviewer", END)
workflow.add_edge("general_chat", END)

app = workflow.compile()
