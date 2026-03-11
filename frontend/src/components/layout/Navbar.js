'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles, Plus, ChevronDown, Brain, FlaskConical,
  GraduationCap, Workflow, Search, Bell, Layers
} from 'lucide-react';

const modes = [
  { id: 'explain', label: 'Explain', icon: Brain, color: '#7c3aed' },
  { id: 'research', label: 'Deep Research', icon: FlaskConical, color: '#06b6d4' },
  { id: 'quiz', label: 'Quiz', icon: GraduationCap, color: '#f59e0b' },
  { id: 'diagram', label: 'Diagram', icon: Workflow, color: '#10b981' },
];

const projects = ['RAG Pipeline Research', 'Quantum Physics', 'ML Systems Design', 'Team Project Alpha'];

export default function Navbar({ selectedMode, setSelectedMode }) {
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [activeProject, setActiveProject] = useState(projects[0]);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--clay-border)',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Mode selector pills */}
      <div style={{
        display: 'flex', gap: 4, padding: '4px 6px',
        background: 'var(--bg-subtle)',
        borderRadius: 16,
        border: '1px solid var(--clay-border)',
      }}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = selectedMode === mode.id;
          return (
            <motion.button
              key={mode.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`mode-pill ${isActive ? 'active' : ''}`}
              style={{
                ...(isActive ? { '--accent-primary': mode.color, '--accent-primary-light': mode.color + '22' } : {}),
              }}
            >
              <Icon size={13} />
              <span style={{ fontSize: 12 }}>{mode.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Project selector */}
      <div style={{ position: 'relative' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowProjectMenu(!showProjectMenu)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            borderRadius: 12, border: '1px solid var(--clay-border)',
            background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
            cursor: 'pointer', color: 'var(--text-primary)',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          <Layers size={14} color="var(--accent-primary)" />
          <span style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeProject}
          </span>
          <motion.div animate={{ rotate: showProjectMenu ? 180 : 0 }}>
            <ChevronDown size={13} />
          </motion.div>
        </motion.button>

        {showProjectMenu && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            style={{
              position: 'absolute', top: '110%', right: 0,
              width: 220, background: 'var(--clay-bg)',
              boxShadow: 'var(--clay-shadow-lg)', border: '1px solid var(--clay-border)',
              borderRadius: 16, overflow: 'hidden', zIndex: 200,
            }}
          >
            {projects.map((p) => (
              <div
                key={p}
                onClick={() => { setActiveProject(p); setShowProjectMenu(false); }}
                style={{
                  padding: '11px 16px', cursor: 'pointer',
                  fontSize: 13, fontWeight: 500,
                  color: activeProject === p ? 'var(--accent-primary)' : 'var(--text-primary)',
                  background: activeProject === p ? 'var(--accent-primary-light)' : 'transparent',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-item-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = activeProject === p ? 'var(--accent-primary-light)' : 'transparent'}
              >
                {p}
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Group chat button */}
      <Link href="/group-chat" style={{ textDecoration: 'none' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="btn-clay btn-clay-primary"
          style={{ padding: '8px 16px', fontSize: 13, borderRadius: 12 }}
        >
          <Plus size={14} />
          Group Chat
        </motion.button>
      </Link>

      {/* Notifications */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 36, height: 36, borderRadius: 10, border: '1px solid var(--clay-border)',
          background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', color: 'var(--text-secondary)',
        }}
      >
        <Bell size={16} />
        <div style={{
          position: 'absolute', top: 7, right: 7, width: 7, height: 7,
          borderRadius: '50%', background: 'var(--accent-rose)',
          border: '1.5px solid var(--bg-surface)',
        }} />
      </motion.button>
    </motion.header>
  );
}
