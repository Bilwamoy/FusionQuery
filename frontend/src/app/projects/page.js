'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { projects as projectsApi } from '@/lib/api';
import {
  FolderOpen, Plus, Search, Edit2, Trash2, Share2, Calendar,
  FileText, Users, ChevronRight, X, Loader2, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const PROJECT_EMOJIS = ['📁', '🧠', '🚀', '🔬', '📊', '🎯', '💡', '🌐', '🔮', '📚'];
const PROJECT_COLORS = [
  '#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#f43f5e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const [color, setColor] = useState('#7c3aed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) return setError('Project name is required');
    setLoading(true);
    setError('');
    try {
      const project = await projectsApi.create({ name, description, emoji, color });
      onCreate(project);
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="clay"
        style={{ width: 480, borderRadius: 24, padding: 28 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Create New Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Project Icon</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PROJECT_EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 40, height: 40, borderRadius: 12, fontSize: 20, cursor: 'pointer',
                border: `2px solid ${emoji === e ? 'var(--accent-primary)' : 'var(--clay-border)'}`,
                background: emoji === e ? 'var(--accent-primary-light)' : 'var(--bg-subtle)'
              }}>{e}</button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>Color</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PROJECT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width: 28, height: 28, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                outline: color === c ? `3px solid ${c}` : 'none',
                outlineOffset: 2, transition: 'all 0.2s',
              }} />
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Project Name *</label>
          <input
            className="input-clay"
            placeholder="e.g. RAG Research, Quantum Physics Study..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Description</label>
          <textarea
            className="input-clay"
            placeholder="What will you work on in this project?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            style={{ resize: 'none' }}
          />
        </div>

        {error && <p style={{ color: 'var(--accent-rose)', fontSize: 12, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-clay" style={{ flex: 1, padding: '11px 0', fontSize: 14 }} disabled={loading}>Cancel</button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={loading}
            className="btn-clay btn-clay-primary"
            style={{ flex: 2, padding: '11px 0', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? 'Creating...' : 'Create Project'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProjectCard({ project, onDelete }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="clay clay-lift"
      style={{ borderRadius: 22, overflow: 'hidden', cursor: 'pointer' }}
      onClick={() => router.push(`/?project=${project.id}`)}
    >
      {/* Color bar */}
      <div style={{ height: 6, background: `linear-gradient(90deg, ${project.color}, ${project.color}88)` }} />

      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14,
              background: `${project.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              {project.emoji}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{project.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onDelete(project.id)}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {project.description && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12, 
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </p>
        )}

        <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FileText size={12} />
            <span>{project.file_count} files</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Users size={12} />
            <span>{project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: project.color, fontWeight: 700 }}>
            Open <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectsPage() {
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectsApi.list();
      setProjectList(data);
    } catch (e) {
      setError(e.message);
      if (e.message === 'Unauthorized') router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    try {
      await projectsApi.delete(id);
      setProjectList(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = projectList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <FolderOpen size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Projects</span>
          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 12, background: 'var(--bg-subtle)', border: '1px solid var(--clay-border)' }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: 13, color: 'var(--text-primary)', outline: 'none', width: 160, fontFamily: 'inherit' }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreate(true)}
            className="btn-clay btn-clay-primary"
            style={{ padding: '9px 18px', fontSize: 13, gap: 7 }}
          >
            <Plus size={15} />
            New Project
          </motion.button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60%', flexDirection: 'column', gap: 14 }}>
              <Loader2 size={28} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading projects...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--accent-rose)' }}>{error}</div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', gap: 16 }}
            >
              <div style={{ width: 80, height: 80, borderRadius: 28, background: 'var(--accent-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={36} color="var(--accent-primary)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{search ? 'No matching projects' : 'Start your first project'}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                  {search ? 'Try a different search term' : 'Create a project to organize your research and documents'}
                </p>
              </div>
              {!search && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCreate(true)}
                  className="btn-clay btn-clay-primary"
                  style={{ padding: '12px 24px', fontSize: 14 }}
                >
                  <Plus size={16} /> Create Project
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {filtered.map((project, i) => (
                <motion.div key={project.id} transition={{ delay: i * 0.05 }}>
                  <ProjectCard project={project} onDelete={handleDelete} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreate={p => setProjectList(prev => [p, ...prev])} />}
      </AnimatePresence>
    </div>
  );
}
