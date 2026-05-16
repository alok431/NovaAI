import React, { useState } from 'react';
import { Bot, Home, MessageSquare, Settings, Users, Activity, Search, Send, Bell, ChevronRight, Zap, TrendingUp, Shield } from 'lucide-react';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    { id: 1, type: 'system', text: 'Hello! I am Nova, your Enterprise GenAI Assistant, powered by Groq. How can I help you streamline operations today?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage = inputValue;
    // Add user message to UI immediately
    const newMessages = [...messages, { id: Date.now(), type: 'user', text: userMessage }];
    setMessages(newMessages);
    setInputValue('');

    try {
      // Use environment variable for backend URL so it works when deployed!
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Server returned an error');
      }
      
      if (data.reply) {
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          type: 'system', 
          text: data.reply 
        }]);
      }
    } catch (error) {
      console.error("Error calling backend:", error);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        type: 'system', 
        text: `Error connecting to AI: ${error.message}` 
      }]);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Bot size={24} />
          </div>
          <span className="logo-text">Nova AI</span>
        </div>
        
        <nav className="nav-menu">
          <a href="#" className="nav-item active">
            <Home size={20} /> Dashboard
          </a>
          <a href="#" className="nav-item">
            <MessageSquare size={20} /> Virtual Assistants
          </a>
          <a href="#" className="nav-item">
            <Activity size={20} /> Analytics
          </a>
          <a href="#" className="nav-item">
            <Users size={20} /> Team
          </a>
          <a href="#" className="nav-item" style={{ marginTop: 'auto' }}>
            <Settings size={20} /> Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Search agents, logs, or metrics..." />
          </div>
          
          <div className="user-profile">
            <button className="glass-btn" style={{ padding: '0.5rem', borderRadius: '50%' }}>
              <Bell size={18} />
            </button>
            <div className="avatar">JD</div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>Enterprise GenAI Platform</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Deploying scalable conversational agents with blazing-fast Groq inference.</p>
            </div>
            <span className="badge">⚡ Groq Powered</span>
          </div>

          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span>Active Agents</span>
                <div className="stat-icon"><Bot size={18} color="var(--accent-color)" /></div>
              </div>
              <div className="stat-value">124</div>
              <div className="stat-trend"><TrendingUp size={14} /> +12% this week</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <span>Total Conversations</span>
                <div className="stat-icon"><MessageSquare size={18} color="var(--accent-secondary)" /></div>
              </div>
              <div className="stat-value">84.2k</div>
              <div className="stat-trend"><TrendingUp size={14} /> +24% this week</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <span>Avg. Resolution Time</span>
                <div className="stat-icon"><Zap size={18} color="#f59e0b" /></div>
              </div>
              <div className="stat-value">1.2m</div>
              <div className="stat-trend" style={{ color: 'var(--success-color)' }}><TrendingUp size={14} /> -15% this week</div>
            </div>
          </div>

          <div className="agent-interface">
            <div className="agent-header">
              <div className="agent-info">
                <div className="agent-avatar">
                  <Bot size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontWeight: '600' }}>Operations Co-Pilot</h3>
                  <div className="agent-status">
                    <div className="status-dot"></div> Online
                  </div>
                </div>
              </div>
              <button className="glass-btn">
                <Shield size={16} /> Enterprise Grade
              </button>
            </div>
            
            <div className="chat-area">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  {msg.type === 'system' && (
                    <div className="avatar" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.1)', fontSize: '0.75rem' }}>AI</div>
                  )}
                  <div className="message-content">
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="input-area">
              <input 
                type="text" 
                className="input-box" 
                placeholder="Ask your assistant to perform an action..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="send-btn" onClick={handleSend}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
