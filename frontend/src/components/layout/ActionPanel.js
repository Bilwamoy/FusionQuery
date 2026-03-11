'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Presentation, StickyNote, HelpCircle,
  Workflow, Quote, Share2, GitCompare, ChevronRight,
  Sparkles, Download, Copy
} from 'lucide-react';

const actions = [
  {
    id: 'pdf', icon: FileText, label: 'Generate PDF', color: '#ef4444',
    bg: '#fef2f2', desc: 'Export as formatted PDF'
  },
  {
    id: 'ppt', icon: Presentation, label: 'Generate PPT', color: '#f59e0b',
    bg: '#fffbeb', desc: 'Create slide deck'
  },
  {
    id: 'notes', icon: StickyNote, label: 'Generate Notes', color: '#10b981',
    bg: '#ecfdf5', desc: 'Structured study notes'
  },
  {
    id: 'quiz', icon: HelpCircle, label: 'Generate Quiz', color: '#7c3aed',
    bg: '#f5f3ff', desc: 'MCQ + short answers'
  },
  {
    id: 'diagram', icon: Workflow, label: 'Generate Diagram', color: '#06b6d4',
    bg: '#ecfeff', desc: 'Flowchart / UML'
  },
  {
    id: 'cite', icon: Quote, label: 'Export Citation', color: '#8b5cf6',
    bg: '#f5f3ff', desc: 'APA / MLA / Chicago'
  },
  {
    id: 'share', icon: Share2, label: 'Share Workspace', color: '#0ea5e9',
    bg: '#f0f9ff', desc: 'Invite collaborators'
  },
  {
    id: 'compare', icon: GitCompare, label: 'Version Compare', color: '#64748b',
    bg: '#f8fafc', desc: 'Diff two versions'
  },
];

export default function ActionPanel() {
  const [activeAction, setActiveAction] = useState(null);
  const [generating, setGenerating] = useState(null);

  const handleAction = (id) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        width: 240,
        height: '100%',
        overflowY: 'auto',
        padding: '16px 12px',
        borderLeft: '1px solid var(--clay-border)',
        background: 'var(--bg-raised)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Sparkles size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Actions</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>Generate structured outputs from your knowledge</p>
      </div>

      {/* Action buttons */}
      {actions.map((action) => {
        const Icon = action.icon;
        const isGenerating = generating === action.id;

        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 12px',
              borderRadius: 14, border: '1px solid var(--clay-border)',
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              width: '100%', position: 'relative', overflow: 'hidden',
              transition: 'all 0.2s',
            }}
          >
            {/* Shimmer on generating */}
            {isGenerating && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 0.8, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  pointerEvents: 'none',
                }}
              />
            )}

            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: action.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isGenerating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles size={16} color={action.color} />
                </motion.div>
              ) : (
                <Icon size={16} color={action.color} />
              )}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                {isGenerating ? 'Generating...' : action.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{action.desc}</div>
            </div>

            <ChevronRight size={13} color="var(--text-muted)" />
          </motion.button>
        );
      })}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--clay-border)', margin: '4px 0' }} />

      {/* Quick export */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 2px' }}>Quick Export</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { label: 'Copy', icon: Copy },
          { label: 'Download', icon: Download },
          { label: 'Share', icon: Share2 },
        ].map(({ label, icon: Icon }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 4px', borderRadius: 10, border: '1px solid var(--clay-border)',
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <Icon size={14} color="var(--accent-primary)" />
            <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
}
