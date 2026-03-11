'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import {
  MessageSquare, Users, FolderKanban, Image, History,
  Network, BarChart2, Settings, Plus, ChevronLeft,
  ChevronRight, Sparkles, BookOpen, GraduationCap,
  Star, Folder, Hash, Zap
} from 'lucide-react';

const navSections = [
  {
    label: null,
    items: [
      { icon: Plus, label: 'New Chat', href: '/', special: true },
    ]
  },
  {
    label: 'Chats',
    items: [
      { icon: MessageSquare, label: 'Personal Chats', href: '/' },
      { icon: Users, label: 'Group Chats', href: '/group-chat' },
    ]
  },
  {
    label: 'Workspace',
    items: [
      { icon: FolderKanban, label: 'Projects', href: '/projects' },
      { icon: Network, label: 'Knowledge Graph', href: '/knowledge-graph' },
      { icon: Image, label: 'Gallery', href: '/gallery' },
      { icon: History, label: 'Version History', href: '/versions' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { icon: BarChart2, label: 'Analytics', href: '/analytics' },
      { icon: Zap, label: 'Whiteboard', href: '/whiteboard' },
    ]
  },
  {
    label: 'Other',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings' },
    ]
  },
];

const recentChats = [
  { id: 1, title: 'RAG Architecture Overview', time: '2m ago', color: '#7c3aed' },
  { id: 2, title: 'Quantum Computing Notes', time: '1h ago', color: '#06b6d4' },
  { id: 3, title: 'ML Paper Summary', time: '3h ago', color: '#f59e0b' },
  { id: 4, title: 'Team Standup Docs', time: 'Yesterday', color: '#10b981' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 256 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        flexShrink: 0,
        overflow: 'hidden',
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '0 14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{
                width: 36, height: 36,
                borderRadius: 12,
                background: 'linear-gradient(135deg, var(--accent-primary), #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                flexShrink: 0
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.2 }}>CollabMind</div>
                <div style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.05em' }}>AI WORKSPACE</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent-primary), #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            margin: '0 auto',
          }}>
            <Sparkles size={18} color="white" />
          </div>
        )}

        {!collapsed && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(true)}
            style={{
              width: 28, height: 28, borderRadius: 8, border: '1px solid var(--clay-border)',
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            }}
          >
            <ChevronLeft size={14} />
          </motion.button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCollapsed(false)}
            style={{
              width: 28, height: 28, borderRadius: 8, border: '1px solid var(--clay-border)',
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-sm)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
            }}
          >
            <ChevronRight size={14} />
          </motion.button>
        </div>
      )}

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 8px' }}>
        {navSections.map((section, si) => (
          <div key={si} style={{ marginBottom: 8 }}>
            {section.label && !collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ padding: '6px 8px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {section.label}
              </motion.div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href + item.label} href={item.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    style={{
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '10px' : undefined,
                      ...(item.special ? {
                        background: 'linear-gradient(135deg, var(--accent-primary), #5b21b6)',
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
                        marginBottom: 4,
                      } : {}),
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Recent Chats */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ marginBottom: 8 }}
          >
            <div style={{ padding: '6px 8px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Recent
            </div>
            {recentChats.map((chat) => (
              <motion.div
                key={chat.id}
                whileHover={{ x: 2 }}
                className="sidebar-item"
                style={{ gap: 10, cursor: 'pointer' }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: chat.color, flexShrink: 0 }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{chat.time}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* User profile at bottom */}
      <div style={{ padding: '12px 8px 0', borderTop: '1px solid var(--sidebar-border)' }}>
        <motion.div
          whileHover={{ x: 1 }}
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 8px', borderRadius: 12, cursor: 'pointer',
            transition: 'background 0.2s',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          className="sidebar-item"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: 'white', flexShrink: 0
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user?.name || 'Guest'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sign out</div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.aside>
  );
}
