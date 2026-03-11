'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Plus, Sparkles, Radio } from 'lucide-react';

export default function Footer({ onSend }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend?.(input);
    setInput('');
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      style={{
        padding: '12px 20px 16px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--clay-border)',
        position: 'relative',
      }}
    >
      {/* Main input row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'var(--clay-bg)',
        boxShadow: 'var(--clay-shadow)',
        border: '1px solid var(--clay-border)',
        borderRadius: 20,
        padding: '8px 8px 8px 16px',
      }}>
        {/* File attach */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Attach file"
          style={{
            width: 34, height: 34, borderRadius: 10, border: '1px solid var(--clay-border)',
            background: 'var(--bg-subtle)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', flexShrink: 0,
          }}
        >
          <Plus size={16} />
        </motion.button>

        {/* Text input */}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask anything about your documents..."
          style={{
            flex: 1, border: 'none', outline: 'none',
            background: 'transparent', fontSize: 14,
            color: 'var(--text-primary)', fontFamily: 'inherit',
          }}
        />

        {/* Voice toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title="AI voice response"
          style={{
            width: 34, height: 34, borderRadius: 10, border: '1px solid var(--clay-border)',
            background: voiceEnabled ? 'var(--accent-primary-light)' : 'var(--bg-subtle)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: voiceEnabled ? 'var(--accent-primary)' : 'var(--text-muted)', flexShrink: 0,
          }}
        >
          <Radio size={15} />
        </motion.button>

        {/* Voice input */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsListening(!isListening)}
          style={{
            width: 34, height: 34, borderRadius: 10, border: 'none',
            background: isListening ? 'var(--accent-rose)' : 'var(--bg-subtle)',
            border: '1px solid var(--clay-border)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isListening ? 'white' : 'var(--text-muted)', flexShrink: 0,
            ...(isListening ? { boxShadow: '0 0 12px rgba(244,63,94,0.4)', animation: 'pulse-glow 1s infinite' } : {}),
          }}
        >
          <Mic size={15} />
        </motion.button>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            height: 34, padding: '0 16px', borderRadius: 12, border: 'none',
            background: input.trim() ? 'linear-gradient(135deg, var(--accent-primary), #5b21b6)' : 'var(--bg-subtle)',
            color: input.trim() ? 'white' : 'var(--text-muted)',
            cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
            transition: 'background 0.2s',
            boxShadow: input.trim() ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
          }}
        >
          <Sparkles size={13} />
          Send
        </motion.button>
      </div>
    </motion.div>
  );
}
