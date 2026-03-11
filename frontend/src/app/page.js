'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import ActionPanel from '@/components/layout/ActionPanel';
import Footer from '@/components/layout/Footer';
import {
  Sparkles, Upload, FileText, Link2, Youtube, Image,
  ChevronDown, CheckCircle, AlertTriangle, ExternalLink,
  Maximize2, ToggleLeft, ToggleRight, BookOpen, Star
} from 'lucide-react';
import Link from 'next/link';

const MOCK_MESSAGES = [
  {
    id: 1, role: 'user',
    content: 'Can you explain the core components of a RAG architecture and how they work together?',
    time: '10:22 AM',
  },
  {
    id: 2, role: 'ai',
    content: `**Retrieval-Augmented Generation (RAG)** is a framework that enhances LLMs by grounding their responses in a retrieved knowledge base.

**Core Components:**

1. **Document Ingestion Pipeline** — Files are chunked, embedded, and stored in a vector database
2. **Query Embedding** — User queries are converted to vectors using the same embedding model
3. **Vector Similarity Search** — Top-K relevant chunks are retrieved via cosine similarity
4. **Context Assembly** — Retrieved chunks are assembled with token-limit awareness
5. **LLM Generation** — The model generates grounded answers using the context
6. **Source Attribution** — Citations are mapped back to original documents`,
    time: '10:22 AM',
    confidence: 97,
    sources: ['RAG Architecture.pdf', 'Vector DB Guide.docx'],
  },
  {
    id: 3, role: 'user',
    content: 'What are the hallucination control mechanisms?',
    time: '10:24 AM',
  },
  {
    id: 4, role: 'ai',
    content: `Several mechanisms prevent hallucination in RAG systems:

- **Similarity threshold cutoff** — Reject results below a confidence score
- **Source-required mode** — Only answer if grounded in uploaded documents
- **Confidence scoring** — Display reliability estimate alongside answers
- **Rejection fallback** — Return "Insufficient context" rather than guessing`,
    time: '10:24 AM',
    confidence: 91,
    sources: ['LLM Safety Guide.pdf'],
  },
];

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 16 }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Sparkles size={15} color="white" />
      </div>
      <div className="chat-bubble-ai" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '14px 18px' }}>
        {[0,1,2].map(i => (
          <div key={i} className="typing-dot" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }) {
  const [showSources, setShowSources] = useState(false);

  if (message.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}
      >
        <div>
          <div className="chat-bubble-user">
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{message.content}</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{message.time}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-primary), #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4
      }}>
        <Sparkles size={15} color="white" />
      </div>

      <div style={{ flex: 1, maxWidth: '75%' }}>
        <div className="chat-bubble-ai">
          <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
            {message.content.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '4px 0' }}
                dangerouslySetInnerHTML={{
                  __html: line
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^(\d+)\.\s\*\*(.+?)\*\*/, '$1. <strong>$2</strong>')
                    .replace(/^- /, '• ')
                }}
              />
            ))}
          </div>

          {/* Confidence + sources */}
          {message.confidence && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--clay-border)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className={`confidence-badge ${message.confidence >= 90 ? 'confidence-high' : message.confidence >= 70 ? 'confidence-medium' : 'confidence-low'}`}>
                <CheckCircle size={11} />
                {message.confidence}% confident
              </span>
              <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 100, background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                Grounded
              </span>

              {message.sources && (
                <button
                  onClick={() => setShowSources(!showSources)}
                  style={{
                    marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 11, color: 'var(--accent-secondary)', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {message.sources.length} sources
                  <motion.div animate={{ rotate: showSources ? 180 : 0 }}>
                    <ChevronDown size={11} />
                  </motion.div>
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {showSources && message.sources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {message.sources.map((src) => (
                    <div key={src} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px', borderRadius: 8, background: 'var(--bg-subtle)',
                      fontSize: 12, color: 'var(--text-secondary)',
                    }}>
                      <FileText size={12} color="var(--accent-primary)" />
                      {src}
                      <ExternalLink size={11} color="var(--text-muted)" style={{ marginLeft: 'auto', cursor: 'pointer' }} />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{message.time}</div>
      </div>
    </motion.div>
  );
}

function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <motion.div
      animate={{ borderColor: isDragging ? 'var(--accent-primary)' : 'var(--clay-border)' }}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => { e.preventDefault(); setIsDragging(false); }}
      style={{
        border: '2px dashed var(--clay-border)', borderRadius: 20,
        padding: '32px 20px', textAlign: 'center',
        background: isDragging ? 'var(--accent-primary-light)' : 'var(--bg-subtle)',
        transition: 'all 0.2s', cursor: 'pointer', marginBottom: 24,
      }}
    >
      <motion.div
        animate={{ y: isDragging ? -4 : 0 }}
        style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}
      >
        {[FileText, Image, Youtube, Link2].map((Icon, i) => (
          <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ delay: i * 0.15, duration: 2, repeat: Infinity }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
              border: '1px solid var(--clay-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} color="var(--accent-primary)" />
            </div>
          </motion.div>
        ))}
      </motion.div>
      <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
        Drop files or paste links here
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
        PDF, DOCX, TXT, Images, YouTube URLs, Google Drive links
      </p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMode, setSelectedMode] = useState('explain');
  const [sourceOnly, setSourceOnly] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = (input) => {
    const userMsg = { id: Date.now(), role: 'user', content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        content: 'Based on your uploaded documents, here is a grounded answer to your question. The system has retrieved the most relevant context chunks and assembled a response with full source attribution.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 88,
        sources: ['RAG Architecture.pdf'],
      }]);
    }, 2200);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Navbar selectedMode={selectedMode} setSelectedMode={setSelectedMode} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Chat area */}
          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Source toggle bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
              background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)',
            }}>
              <button
                onClick={() => setSourceOnly(!sourceOnly)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  color: sourceOnly ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: 13, fontWeight: 600,
                }}
              >
                {sourceOnly ? <ToggleRight size={20} color="var(--accent-primary)" /> : <ToggleLeft size={20} />}
                Answer only from uploaded sources
              </button>
              <div style={{ flex: 1 }} />
              <Link href="/whiteboard" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-clay" style={{ padding: '7px 14px', fontSize: 12 }}>
                  <Maximize2 size={13} /> Open Whiteboard
                </motion.button>
              </Link>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 12px' }}>
              <UploadZone />
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
              <AnimatePresence>
                {isTyping && <TypingIndicator />}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            <Footer onSend={handleSend} />
          </main>

          <ActionPanel />
        </div>
      </div>
    </div>
  );
}
