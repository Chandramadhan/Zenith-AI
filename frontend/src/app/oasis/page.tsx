"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Upload, Send, Loader2, User, Bot, Volume2 } from 'lucide-react';
import axios from 'axios';

export default function InterviewOasis() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  
  const recognitionRef = useRef<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    // Load History
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiUrl}/history/oasis_session`);
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

    // Initialize Speech Recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Initialize Voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      const defaultVoice = availableVoices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || availableVoices[0];
      if (defaultVoice) setSelectedVoice(defaultVoice.name);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, [apiUrl]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await axios.post(`${apiUrl}/upload-resume`, formData);
      setResumeText(res.data.text);
      const welcomeMsg = "Resume received! I've analyzed your background. Whenever you're ready, say 'Start' or type a message to begin the interview.";
      setMessages([{ role: 'bot', content: welcomeMsg }]);
      speak(welcomeMsg);
    } catch (err) {
      console.error(err);
      alert("Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const speak = (text: string) => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInputText("");
    setIsLoading(true);

    const formData = new FormData();
    formData.append('message', text);
    formData.append('mode', 'oasis');
    formData.append('resume_text', resumeText);
    formData.append('session_id', 'oasis_session');

    try {
      const res = await axios.post(`${apiUrl}/chat`, formData);
      setMessages([...newMessages, { role: 'bot', content: res.data.response }]);
      speak(res.data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto flex flex-col h-[90vh]">
        <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">INTERVIEW <span className="text-purple-500">OASIS</span></h1>
            <p className="text-gray-400 text-sm">Real-time Mock Interviewer</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
              <Volume2 className="h-4 w-4 text-purple-500" />
              <select 
                value={selectedVoice} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="bg-transparent text-xs outline-none max-w-[150px]"
              >
                {voices.filter(v => v.lang.startsWith('en')).map((voice) => (
                  <option key={voice.name} value={voice.name} className="bg-black text-white">
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="cursor-pointer flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-sm">
              {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {resumeText ? "Update Resume" : "Upload Resume"}
              <input type="file" className="hidden" accept=".pdf" onChange={handleResumeUpload} />
            </label>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Bot className="h-12 w-12 mb-4 text-purple-500" />
              <p>Upload your resume to start the mock interview session.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600' : 'bg-white/10 border border-white/5'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/5 p-4 rounded-2xl">
                <Loader2 className="animate-spin h-5 w-5 text-purple-500" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button 
            onClick={toggleRecording}
            className={`p-4 rounded-xl transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
              placeholder="Type your answer..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-all"
            />
            <button 
              onClick={() => handleSendMessage(inputText)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-purple-500 hover:text-purple-400"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
