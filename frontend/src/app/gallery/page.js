'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { gallery as galleryApi, auth as authApi } from '@/lib/api';
import { Image, FileText, Presentation, StickyNote, HelpCircle, Download, Eye, Sparkles, Loader2, Trash2, X, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const TYPE_ICONS = { pdf: FileText, ppt: Presentation, notes: StickyNote, quiz: HelpCircle };
const TYPE_LABELS = { pdf: 'PDF', ppt: 'Presentation', notes: 'Notes', quiz: 'Quiz' };
const TYPE_COLORS = { pdf: '#ef4444', ppt: '#f59e0b', notes: '#10b981', quiz: '#7c3aed' };
const TYPE_BACKGROUNDS = { pdf: '#fef2f2', ppt: '#fffbeb', notes: '#ecfdf5', quiz: '#f5f3ff' };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function PreviewModal({ item, onClose }) {
  const previewUrl = `${API_URL}/gallery/preview/${item.id}`;
  const downloadUrl = `${API_URL}/gallery/download/${item.id}`;
  const token = authApi.getToken();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="clay"
        style={{ width: '90%', maxWidth: 800, height: '80vh', borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--clay-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{item.title}</span>
          <a
            href={`${downloadUrl}?auth=${token}`}
            download
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
          >
            <Download size={13} /> Download
          </a>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        
        <div style={{ flex: 1, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.output_type === 'pdf' || item.output_type === 'notes' || item.output_type === 'quiz' ? (
            <iframe
              src={`${previewUrl}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={item.title}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Preview not available for this format</p>
              <a
                href={downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', borderRadius: 12, background: 'var(--accent-primary)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
              >
                <Download size={16} /> Download to View
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Use first project or null
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    // Get project from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const pid = params.get('project') || localStorage.getItem('collabmind_last_project');
    if (pid) {
      setProjectId(pid);
      loadGallery(pid);
    } else {
      setLoading(false);
    }
  }, []);

  const loadGallery = async (pid) => {
    setLoading(true);
    try {
      const data = await galleryApi.list(pid);
      setItems(data);
    } catch (e) {
      if (e.message === 'Unauthorized') router.push('/login');
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (type) => {
    if (!projectId) { setError('Please open a project first'); return; }
    setGenerating(true);
    try {
      const titles = { pdf: 'Research Summary PDF', ppt: 'Knowledge Presentation', notes: 'Study Notes', quiz: 'Knowledge Quiz' };
      const item = await galleryApi.generate({ project_id: projectId, output_type: type, title: titles[type] });
      setItems(prev => [item, ...prev]);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await galleryApi.delete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDownload = (item) => {
    const url = `${API_URL}/gallery/download/${item.id}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = item.title;
    a.click();
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.output_type === filter);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <Image size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Gallery</span>
          <div style={{ flex: 1 }} />

          {/* Generate buttons */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['pdf', 'ppt', 'notes', 'quiz'].map(type => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleGenerate(type)}
                disabled={generating || !projectId}
                style={{
                  padding: '6px 12px', borderRadius: 10,
                  border: `1px solid ${TYPE_COLORS[type]}40`,
                  background: `${TYPE_COLORS[type]}10`,
                  color: TYPE_COLORS[type],
                  fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  opacity: (generating || !projectId) ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <Plus size={11} /> {TYPE_LABELS[type]}
              </motion.button>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['all', 'pdf', 'ppt', 'notes', 'quiz'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '5px 12px', borderRadius: 100, border: '1px solid var(--clay-border)',
                background: filter === f ? 'var(--accent-primary)' : 'var(--clay-bg)',
                color: filter === f ? 'white' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.2s', textTransform: 'capitalize',
              }}>
                {f === 'all' ? 'All' : TYPE_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {!projectId && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Open a project to see its gallery</p>
              <motion.button whileHover={{ scale: 1.03 }} onClick={() => router.push('/projects')}
                className="btn-clay btn-clay-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                Browse Projects
              </motion.button>
            </div>
          )}

          {loading && projectId && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <Loader2 size={24} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {error && <p style={{ color: 'var(--accent-rose)', fontSize: 13, marginBottom: 12 }}>{error}</p>}

          {!loading && projectId && filtered.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No generated outputs yet. Click PDF, PPT, Notes or Quiz above to generate.</p>
            </div>
          )}

          {generating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'var(--accent-primary-light)', border: '1px solid var(--accent-primary)', marginBottom: 16 }}>
              <Loader2 size={16} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--accent-primary)', fontWeight: 600 }}>Generating your document...</span>
            </motion.div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
            {filtered.map((item, i) => {
              const Icon = TYPE_ICONS[item.output_type] || FileText;
              const color = TYPE_COLORS[item.output_type] || '#7c3aed';
              const bg = TYPE_BACKGROUNDS[item.output_type] || '#f5f3ff';
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="clay"
                  style={{ borderRadius: 22, overflow: 'hidden' }}
                >
                  <div style={{ height: 130, background: `linear-gradient(135deg, ${bg}, ${color}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 16, background: bg, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={26} color={color} />
                    </div>
                    <div style={{ position: 'absolute', top: 10, right: 10, padding: '3px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 700, color }}>
                      {TYPE_LABELS[item.output_type]}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ position: 'absolute', top: 10, left: 10, width: 26, height: 26, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                      {new Date(item.created_at).toLocaleDateString()} · {Math.round(item.file_size / 1024)}KB
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPreview(item)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '7px 0', borderRadius: 10, border: '1px solid var(--clay-border)',
                        background: 'var(--bg-subtle)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        color: 'var(--text-secondary)', fontFamily: 'inherit',
                      }}>
                        <Eye size={13} /> Preview
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDownload(item)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '7px 0', borderRadius: 10, border: 'none',
                        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                        cursor: 'pointer', fontSize: 12, fontWeight: 600,
                        color: 'white', fontFamily: 'inherit',
                        boxShadow: `0 4px 10px ${color}40`,
                      }}>
                        <Download size={13} /> Download
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {preview && <PreviewModal item={preview} onClose={() => setPreview(null)} />}
      </AnimatePresence>
    </div>
  );
}
