'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { History, GitCompare, RotateCcw, Clock, FileText, ChevronRight } from 'lucide-react';

const VERSIONS = [
  { id: 1, label: 'v1.4', desc: 'Added hallucination control section', time: 'Today, 2:30 PM', author: 'Sourav', type: 'major', size: '+1.2 KB' },
  { id: 2, label: 'v1.3', desc: 'Whiteboard AI prompt examples expanded', time: 'Today, 11:00 AM', author: 'Sourav', type: 'minor', size: '+340 B' },
  { id: 3, label: 'v1.2', desc: 'RAG pipeline diagram regenerated', time: 'Yesterday, 6:45 PM', author: 'Auto-save', type: 'auto', size: '+2.1 KB' },
  { id: 4, label: 'v1.1', desc: 'Fixed source attribution references', time: 'Yesterday, 3:10 PM', author: 'Sourav', type: 'minor', size: '-80 B' },
  { id: 5, label: 'v1.0', desc: 'Initial document export', time: 'Mar 9, 10:00 AM', author: 'Sourav', type: 'major', size: '14.5 KB' },
];

const TYPE_STYLES = {
  major: { color: '#7c3aed', bg: '#f5f3ff', label: 'Major' },
  minor: { color: '#06b6d4', bg: '#ecfeff', label: 'Minor' },
  auto: { color: '#64748b', bg: '#f8fafc', label: 'Auto-save' },
};

const DIFF_LINES = [
  { type: 'add', text: '+ Hallucination control mechanisms added to Section 3.4' },
  { type: 'add', text: '+ Confidence score threshold: 70% minimum' },
  { type: 'remove', text: '- Old fallback message: "No answer found"' },
  { type: 'neutral', text: '  Context assembly rules: token limit awareness preserved' },
  { type: 'add', text: '+ Source rejection if similarity < 0.65 threshold' },
  { type: 'remove', text: '- Legacy vector timeout value: 1000ms' },
  { type: 'add', text: '+ Updated vector timeout: 800ms with graceful degradation' },
];

export default function VersionsPage() {
  const [selected, setSelected] = useState(1);
  const [comparing, setComparing] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <History size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Version History</span>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Timeline */}
          <div style={{
            width: 300, padding: '20px 16px', borderRight: '1px solid var(--clay-border)',
            overflowY: 'auto', background: 'var(--bg-raised)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Timeline
            </div>

            <div style={{ position: 'relative' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: 20, top: 20, bottom: 20, width: 2, background: 'var(--clay-border)', borderRadius: 1 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {VERSIONS.map((v, i) => {
                  const style = TYPE_STYLES[v.type];
                  const isSelected = selected === v.id;
                  return (
                    <motion.div
                      key={v.id}
                      whileHover={{ x: 3 }}
                      onClick={() => setSelected(v.id)}
                      style={{
                        display: 'flex', gap: 14, paddingBottom: i < VERSIONS.length - 1 ? 20 : 0,
                        cursor: 'pointer', position: 'relative',
                      }}
                    >
                      {/* Dot */}
                      <div style={{
                        width: 40, display: 'flex', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1
                      }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', marginTop: 2,
                          background: isSelected ? style.color : 'var(--clay-bg)',
                          border: `2px solid ${style.color}`,
                          boxShadow: isSelected ? `0 0 0 3px ${style.color}30` : 'none',
                          transition: 'all 0.2s',
                        }} />
                      </div>

                      <div style={{
                        flex: 1, padding: '8px 12px', borderRadius: 14,
                        background: isSelected ? style.bg : 'transparent',
                        border: `1px solid ${isSelected ? style.color + '30' : 'transparent'}`,
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: style.color }}>{v.label}</span>
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: style.bg, color: style.color, fontWeight: 700 }}>
                            {style.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, marginBottom: 3, lineHeight: 1.4 }}>{v.desc}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <Clock size={11} /> {v.time}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail panel */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            {VERSIONS.filter(v => v.id === selected).map(v => {
              const style = TYPE_STYLES[v.type];
              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                        <span style={{ fontSize: 22, fontWeight: 900, color: style.color }}>{v.label}</span>
                        <span style={{ padding: '4px 12px', borderRadius: 100, background: style.bg, color: style.color, fontSize: 12, fontWeight: 700 }}>{style.label}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>{v.time} · By {v.author} · {v.size}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-clay" style={{ padding: '9px 16px', fontSize: 12 }}>
                        <GitCompare size={13} /> Compare
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-clay btn-clay-primary" style={{ padding: '9px 16px', fontSize: 12 }}>
                        <RotateCcw size={13} /> Restore
                      </motion.button>
                    </div>
                  </div>

                  {/* Diff view */}
                  <div className="clay" style={{ borderRadius: 20, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--clay-border)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', gap: 16 }}>
                      <span style={{ color: '#10b981' }}>+5 additions</span>
                      <span style={{ color: 'var(--accent-rose)' }}>-2 deletions</span>
                    </div>
                    <div style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: 13 }}>
                      {DIFF_LINES.map((line, i) => (
                        <div key={i} style={{
                          padding: '4px 18px',
                          background: line.type === 'add' ? 'rgba(16,185,129,0.07)' : line.type === 'remove' ? 'rgba(244,63,94,0.07)' : 'transparent',
                          color: line.type === 'add' ? '#10b981' : line.type === 'remove' ? 'var(--accent-rose)' : 'var(--text-secondary)',
                          lineHeight: 1.8,
                        }}>
                          {line.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
