'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { Network, Info, ZoomIn, ZoomOut, Filter } from 'lucide-react';

const MOCK_NODES = [
  { id: 1, label: 'RAG Architecture', type: 'topic', x: 380, y: 220, size: 60 },
  { id: 2, label: 'Vector DB', type: 'concept', x: 220, y: 140, size: 50 },
  { id: 3, label: 'Embeddings', type: 'concept', x: 540, y: 130, size: 50 },
  { id: 4, label: 'LLM', type: 'concept', x: 260, y: 320, size: 46 },
  { id: 5, label: 'RAG_Guide.pdf', type: 'file', x: 500, y: 320, size: 44 },
  { id: 6, label: 'Chunking', type: 'concept', x: 140, y: 260, size: 40 },
  { id: 7, label: 'Similarity Search', type: 'concept', x: 600, y: 250, size: 44 },
  { id: 8, label: 'Sourav', type: 'user', x: 140, y: 380, size: 40 },
  { id: 9, label: 'Quantum Notes.pdf', type: 'file', x: 420, y: 380, size: 40 },
  { id: 10, label: 'Prompt Engineering', type: 'topic', x: 310, y: 440, size: 44 },
];

const EDGES = [
  [1, 2], [1, 3], [1, 4], [1, 5], [2, 6], [3, 7], [3, 1],
  [5, 1], [5, 9], [8, 1], [10, 4], [10, 1],
];

const NODE_COLORS = {
  topic: { fill: '#7c3aed', light: '#ede9fe', label: 'Topic' },
  concept: { fill: '#06b6d4', light: '#cffafe', label: 'Concept' },
  file: { fill: '#f59e0b', light: '#fef3c7', label: 'File' },
  user: { fill: '#10b981', light: '#d1fae5', label: 'User' },
};

export default function KnowledgeGraphPage() {
  const [tooltip, setTooltip] = useState(null);
  const [filter, setFilter] = useState('all');
  const [hoveredNode, setHoveredNode] = useState(null);

  const filteredNodes = filter === 'all' ? MOCK_NODES : MOCK_NODES.filter(n => n.type === filter);
  const filteredIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = EDGES.filter(([a, b]) => filteredIds.has(a) && filteredIds.has(b));

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <Network size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Knowledge Graph</span>
          <div style={{ flex: 1 }} />

          {/* Filters */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'topic', 'concept', 'file', 'user'].map(f => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: 100, border: '1px solid var(--clay-border)',
                  background: filter === f ? 'var(--accent-primary)' : 'var(--clay-bg)',
                  color: filter === f ? 'white' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: filter === f ? '0 4px 10px rgba(124,58,237,0.3)' : 'var(--clay-shadow-sm)',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Graph area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" style={{ background: 'var(--bg-subtle)' }}>
            {/* Edges */}
            {filteredEdges.map(([a, b], i) => {
              const na = MOCK_NODES.find(n => n.id === a);
              const nb = MOCK_NODES.find(n => n.id === b);
              if (!na || !nb) return null;
              return (
                <line key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="var(--clay-border)"
                  strokeWidth={hoveredNode === a || hoveredNode === b ? 2.5 : 1.5}
                  strokeOpacity={hoveredNode && hoveredNode !== a && hoveredNode !== b ? 0.3 : 0.7}
                  markerEnd="url(#arrow)"
                />
              );
            })}

            {/* Arrow marker */}
            <defs>
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="var(--text-muted)" fillOpacity={0.6} />
              </marker>
            </defs>

            {/* Nodes */}
            {filteredNodes.map(node => {
              const col = NODE_COLORS[node.type];
              const isHovered = hoveredNode === node.id;
              return (
                <g key={node.id}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => { setHoveredNode(node.id); setTooltip(node); }}
                  onMouseLeave={() => { setHoveredNode(null); setTooltip(null); }}
                >
                  <circle cx={node.x} cy={node.y} r={node.size / 2 + (isHovered ? 6 : 0)}
                    fill={col.light} opacity={0.7}
                    style={{ transition: 'all 0.2s' }}
                  />
                  <circle cx={node.x} cy={node.y} r={node.size / 2}
                    fill={col.fill} opacity={isHovered ? 1 : 0.85}
                    stroke="white" strokeWidth={2}
                    style={{ filter: isHovered ? `drop-shadow(0 4px 10px ${col.fill}60)` : 'none', transition: 'all 0.2s' }}
                  />
                  <text x={node.x} y={node.y + node.size / 2 + 16}
                    textAnchor="middle" fontSize={11} fontWeight={600}
                    fill="var(--text-secondary)" fontFamily="Plus Jakarta Sans"
                  >
                    {node.label.length > 16 ? node.label.slice(0, 14) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div className="graph-tooltip" style={{ top: MOCK_NODES.find(n=>n.id===tooltip.id)?.y + 30, left: MOCK_NODES.find(n=>n.id===tooltip.id)?.x + 20 }}>
              <div style={{ fontWeight: 700, color: NODE_COLORS[tooltip.type].fill, marginBottom: 3 }}>{tooltip.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {NODE_COLORS[tooltip.type].label}
              </div>
            </div>
          )}

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute', bottom: 24, right: 24,
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow)',
              border: '1px solid var(--clay-border)', borderRadius: 16, padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Object.entries(NODE_COLORS).map(([type, { fill, label }]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: fill }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
