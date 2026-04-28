"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, AlertCircle, Send, MessageSquare, Plus, X, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Task {
  id: number;
  name: string;
  status: 'pending' | 'completed' | 'overdue';
  deadline: string;
}

export default function GoalGuardian() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Load tasks and HISTORY on mount
  useEffect(() => {
    setIsMounted(true);
    
    // Load Tasks
    const savedTasks = localStorage.getItem('zenith_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, name: "Finish Portfolio Project", status: 'overdue', deadline: "2026-04-27" },
        { id: 2, name: "Prepare for System Design Interview", status: 'pending', deadline: "2026-04-29" },
        { id: 3, name: "Email Recruiter", status: 'pending', deadline: "2026-04-30" },
      ]);
    }

    // Load Chat History from Backend
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/history/default');
        const history = res.data.map((h: any) => ({
          role: h.role === 'human' ? 'user' : 'bot',
          content: h.content
        }));
        setMessages(history);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessages = [...messages, { role: 'user', content: inputText }];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', inputText);
      formData.append('mode', 'guardian');
      formData.append('tasks_json', JSON.stringify(tasks));
      formData.append('session_id', 'default');

      const res = await axios.post('http://127.0.0.1:8000/chat', formData);
      setMessages([...newMessages, { role: 'bot', content: res.data.response }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = () => {
    if (!newTaskName || !newTaskDeadline) return;
    const newTask: Task = {
      id: Date.now(),
      name: newTaskName,
      status: 'pending',
      deadline: newTaskDeadline,
    };
    setTasks([...tasks, newTask]);
    setNewTaskName("");
    setNewTaskDeadline("");
    setShowAddTask(false);
  };

  const toggleTaskStatus = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : t.status } : t));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Task Management Section */}
        <div className="lg:col-span-2 space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GOAL <span className="text-blue-500">GUARDIAN</span></h1>
              <p className="text-gray-400">Agentic Task Management</p>
            </div>
            <button 
              onClick={() => setShowAddTask(true)}
              className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5" />
            </button>
          </header>

          {showAddTask && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 border border-blue-500/30 p-6 rounded-2xl relative z-10"
            >
              <button onClick={() => setShowAddTask(false)} className="absolute right-4 top-4 text-gray-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-lg font-semibold mb-4 text-blue-500">Add New Task</h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="What needs to be done?"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                />
                <input 
                  type="date" 
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 focus:outline-none focus:border-blue-500"
                />
                <button 
                  onClick={addTask}
                  className="w-full py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {tasks.map((task) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={task.id} 
                className={`p-4 rounded-xl border ${task.status === 'overdue' ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'} flex justify-between items-center`}
              >
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleTaskStatus(task.id)}>
                  {task.status === 'completed' ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-gray-500" />}
                  <div>
                    <h3 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-600' : ''}`}>{task.name}</h3>
                    <p className="text-xs text-gray-500">Deadline: {task.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {task.status === 'overdue' && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest">
                      <AlertCircle className="h-4 w-4" />
                      Overdue
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Negotiation Sidebar */}
        <div className="bg-white/5 border border-white/10 rounded-2xl flex flex-col h-[80vh]">
          <div className="p-4 border-b border-white/10 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Agent Negotiation</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-10 text-sm italic">
                The agent will intervene if it detects missed deadlines or productivity blockers.
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white/10 border border-white/5'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 border border-white/5 p-3 rounded-xl">
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                    Typing...
                  </motion.div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/10">
            <div className="relative">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Message your agent..."
                className="w-full bg-black border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 p-1"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
