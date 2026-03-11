'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import { Users, Plus, Sparkles, Crown, Pen, Brain, Code2, StickyNote, FolderKanban, Workflow } from 'lucide-react';

const AI_AGENTS = [
  { id: 'research', tag: '@ResearchAI', label: 'Research Assistant', icon: Brain, color: '#7c3aed', bg: '#f5f3ff', desc: 'Evidence-backed answers with citations' },
  { id: 'code', tag: '@CodeAI', label: 'Code Reviewer', icon: Code2, color: '#06b6d4', bg: '#ecfeff', desc: 'Code quality & optimization feedback' },
  { id: 'devil', tag: '@DevilAI', label: "Devil's Advocate", icon: Sparkles, color: '#f59e0b', bg: '#fffbeb', desc: 'Challenges assumptions critically' },
  { id: 'notes', tag: '@NotesAI', label: 'Note Summarizer', icon: StickyNote, color: '#10b981', bg: '#ecfdf5', desc: 'Concise structured summaries' },
  { id: 'plan', tag: '@PlannerAI', label: 'Project Planner', icon: FolderKanban, color: '#f43f5e', bg: '#fff1f2', desc: 'Timeline & task breakdown' },
  { id: 'diagram', tag: '@DiagramAI', label: 'Diagram Architect', icon: Workflow, color: '#3b82f6', bg: '#eff6ff', desc: 'Visual diagrams & flowcharts' },
];

const MEMBERS = [
  { name: 'Sourav', color: '#f59e0b', role: 'Owner', online: true },
  { name: 'Alex', color: '#7c3aed', role: 'Editor', online: true },
  { name: 'Priya', color: '#10b981', role: 'Viewer', online: false },
];

const MOCK_GROUP_MESSAGES = [
  { id: 1, role: 'user', author: 'Sourav', color: '#f59e0b', content: '@ResearchAI What are the key challenges in scaling RAG systems?', time: '10:15 AM' },
  { id: 2, role: 'ai', agentId: 'research', content: 'Based on the uploaded research papers, the three primary scaling challenges are:\n\n**1. Vector Index Size** — As documents grow, FAISS/HNSW indices require more memory\n**2. Embedding Throughput** — Batch embedding generation becomes a bottleneck at scale\n**3. Context Window Management** — Fitting top-K chunks within LLM token limits\n\n*Sources: Scaling_RAG.pdf, Vector_Systems.docx*', time: '10:15 AM' },
  { id: 3, role: 'user', author: 'Alex', color: '#7c3aed', content: '@DiagramAI Can you create a visual for the scaling bottlenecks?', time: '10:18 AM' },
  { id: 4, role: 'ai', agentId: 'diagram', content: 'I\'ve generated a bottleneck flow diagram in your Whiteboard. The diagram shows three parallel bottleneck nodes (Index Memory, Embedding Queue, Context Window) with throughput arrows connecting them to the output generation stage.', time: '10:18 AM' },
];

export default function GroupChatPage() {
  const [messages, setMessages] = useState(MOCK_GROUP_MESSAGES);
  const [showAgents, setShowAgents] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (input) => {
    const msg = { id: Date.now(), role: 'user', author: 'Sourav', color: '#f59e0b', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, msg]);
    setIsTyping(true);

    // Detect @agent tag
    const agentMatch = AI_AGENTS.find(a => input.includes(a.tag));
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        agentId: agentMatch?.id || 'research',
        content: `I've analyzed your query based on the project knowledge base. Here's what I found relevant to your question about "${input.slice(0, 40)}..."`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{
            height: 60, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
            background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>RAG Research Team</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{MEMBERS.filter(m => m.online).length} online · 6 AI agents available</div>
            </div>
            <div style={{ flex: 1 }} />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAgents(!showAgents)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
                borderRadius: 12, border: 'none',
                background: showAgents ? 'var(--accent-primary)' : 'var(--clay-bg)',
                boxShadow: 'var(--clay-shadow-sm)', border: '1px solid var(--clay-border)',
                color: showAgents ? 'white' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={13} />
              AI Agents
            </motion.button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {messages.map(msg => {
              const agent = AI_AGENTS.find(a => a.id === msg.agentId);
              return (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: 18 }}
                >
                  {msg.role === 'user' ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0 }}>
                        {msg.author[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 5 }}>
                          {msg.author} <span style={{ fontWeight: 400 }}>· {msg.time}</span>
                        </div>
                        <div className="chat-bubble-ai" style={{ display: 'inline-block', maxWidth: 'fit-content' }}>
                          <p style={{ margin: 0, fontSize: 14 }}>{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: agent ? agent.bg : 'var(--accent-primary-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        border: `1.5px solid ${agent?.color || 'var(--accent-primary)'}`,
                      }}>
                        {agent ? <agent.icon size={15} color={agent.color} /> : <Sparkles size={15} color="var(--accent-primary)" />}
                      </div>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5 }}>
                          <span style={{ color: agent?.color || 'var(--accent-primary)' }}>{agent?.label || 'AI'}</span>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {msg.time}</span>
                        </div>
                        <div className="chat-bubble-ai">
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} style={{ margin: '3px 0', fontSize: 14, lineHeight: 1.7 }}
                              dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^- /, '• ') }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="var(--accent-primary)" />
                </div>
                <div className="chat-bubble-ai" style={{ display: 'flex', gap: 5 }}>
                  {[0,1,2].map(i => <div key={i} className="typing-dot" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </motion.div>
            )}
          </div>

          <Footer onSend={handleSend} />
        </div>

        {/* Agents panel */}
        <AnimatePresence>
          {showAgents && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 270, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              style={{
                overflow: 'hidden', borderLeft: '1px solid var(--clay-border)',
                background: 'var(--bg-raised)', flexShrink: 0,
              }}
            >
              <div style={{ padding: '16px 16px 0', width: 270 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>Available AI Agents</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {AI_AGENTS.map(agent => (
                    <motion.div key={agent.id} whileHover={{ x: 2 }} style={{
                      padding: '12px 12px', borderRadius: 14,
                      background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
                      border: '1px solid var(--clay-border)', cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 9, background: agent.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <agent.icon size={15} color={agent.color} />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{agent.label}</div>
                          <div style={{ fontSize: 11, color: agent.color, fontWeight: 600 }}>{agent.tag}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, paddingLeft: 40 }}>{agent.desc}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Members */}
                <div style={{ marginTop: 20, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>Members</div>
                  {MEMBERS.map(m => (
                    <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'white' }}>{m.name[0]}</div>
                        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: m.online ? '#10b981' : '#94a3b8', border: '1.5px solid var(--bg-raised)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.role}</div>
                      </div>
                      {m.role === 'Owner' && <Crown size={12} color="#f59e0b" style={{ marginLeft: 'auto' }} />}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
