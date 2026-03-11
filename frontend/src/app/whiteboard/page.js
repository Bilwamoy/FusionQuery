'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import {
  MousePointer2, Pen, Square, Circle, Minus, ArrowRight,
  Type, StickyNote, Trash2, Undo2, Redo2, ZoomIn, ZoomOut,
  Sparkles, Palette, Download, Share2, ChevronDown, Move
} from 'lucide-react';

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
];

const COLORS = [
  '#7c3aed', '#06b6d4', '#f59e0b', '#10b981',
  '#f43f5e', '#3b82f6', '#1a1033', '#ffffff',
];

const STROKE_WIDTHS = [2, 4, 6, 10];

const AI_PROMPTS = [
  'Create system architecture for RAG pipeline',
  'Draw a flowchart for OAuth 2.0 flow',
  'Generate UML class diagram for User model',
  'Create mind map for machine learning concepts',
];

export default function WhiteboardPage() {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const fabricModuleRef = useRef(null);
  const [activeTool, setActiveTool] = useState('pen');
  const [activeColor, setActiveColor] = useState('#7c3aed');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const init = async () => {
      try {
        const fabric = await import('fabric');
        fabricModuleRef.current = fabric;
        if (!canvasRef.current) return;

        // Dispose previous canvas if it exists (React strict mode double-mount)
        if (fabricRef.current) {
          fabricRef.current.dispose();
          fabricRef.current = null;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const canvas = new fabric.Canvas(canvasRef.current, {
          width: window.innerWidth - 360,
          height: window.innerHeight - 60,
          backgroundColor: isDark ? '#f5f2e8' : '#fdfcff',
          isDrawingMode: true,
          selection: true,
        });

        // Grid lines
        const drawGrid = () => {
          const gridSize = 40;
          const gridColor = isDark ? 'rgba(80,50,150,0.06)' : 'rgba(124,58,237,0.05)';
          for (let i = 0; i < canvas.width; i += gridSize) {
            canvas.add(new fabric.Line([i, 0, i, canvas.height], {
              stroke: gridColor, strokeWidth: 1, selectable: false, evented: false, hoverCursor: 'default'
            }));
          }
          for (let j = 0; j < canvas.height; j += gridSize) {
            canvas.add(new fabric.Line([0, j, canvas.width, j], {
              stroke: gridColor, strokeWidth: 1, selectable: false, evented: false, hoverCursor: 'default'
            }));
          }
        };
        drawGrid();

        // Stylish pen cursor
        canvas.freeDrawingCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='4' fill='%237c3aed' opacity='0.9'/%3E%3Ccircle cx='12' cy='12' r='8' fill='none' stroke='%237c3aed' stroke-width='1.5' opacity='0.4'/%3E%3C/svg%3E") 12 12, crosshair`;

        fabricRef.current = canvas;

        const handleResize = () => {
          canvas.setDimensions({ width: window.innerWidth - 360, height: window.innerHeight - 60 });
          canvas.renderAll();
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
      } catch (err) {
        console.error('Fabric init error:', err);
      }
    };
    init();

    return () => {
      fabricRef.current?.dispose();
    };
  }, []);

  // Tool switching
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = activeTool === 'pen';
    if (canvas.isDrawingMode) {
      if (!canvas.freeDrawingBrush) {
        const fb = fabricModuleRef.current;
        if (fb) canvas.freeDrawingBrush = new fb.PencilBrush(canvas);
      }
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeColor;
        canvas.freeDrawingBrush.width = strokeWidth;
      }
    }
  }, [activeTool, activeColor, strokeWidth]);

  const handleToolClick = (toolId) => {
    setActiveTool(toolId);
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = toolId === 'pen';
    canvas.selection = toolId === 'select';

    const fb = fabricModuleRef.current;
    if (!fb) return;

    if (toolId === 'rect') {
      const rect = new fb.Rect({
        left: 200, top: 200, width: 160, height: 100,
        fill: 'transparent', stroke: activeColor, strokeWidth, rx: 10, ry: 10,
      });
      canvas.add(rect);
    } else if (toolId === 'circle') {
      const circle = new fb.Circle({
        left: 220, top: 220, radius: 60,
        fill: 'transparent', stroke: activeColor, strokeWidth,
      });
      canvas.add(circle);
    } else if (toolId === 'text') {
      const text = new fb.IText('Type here...', {
        left: 200, top: 200, fontSize: 18, fontFamily: 'Plus Jakarta Sans',
        fill: activeColor, editable: true,
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      text.enterEditing();
    } else if (toolId === 'sticky') {
      const rect = new fb.Rect({
        left: 200, top: 200, width: 160, height: 140,
        fill: '#fef9c3', stroke: '#f59e0b', strokeWidth: 1, rx: 12, ry: 12,
        shadow: new fb.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 10, offsetX: 2, offsetY: 4 }),
      });
      const text = new fb.Text('Note...', {
        left: 216, top: 220, fontSize: 14, fontFamily: 'Plus Jakarta Sans', fill: '#92400e'
      });
      canvas.add(rect, text);
    }
    canvas.renderAll();
  };

  const handleClear = () => {
    const canvas = fabricRef.current;
    if (canvas) { canvas.clear(); canvas.backgroundColor = '#fdfcff'; canvas.renderAll(); }
  };

  const handleUndo = () => {
    const canvas = fabricRef.current;
    const objs = canvas?.getObjects();
    if (objs?.length > 0) { canvas.remove(objs[objs.length - 1]); canvas.renderAll(); }
  };

  const handleAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);

    setTimeout(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      // Generate example flowchart nodes
      const nodes = [
        { x: 100, y: 80, label: 'User Query', color: '#7c3aed' },
        { x: 300, y: 80, label: 'Embed Query', color: '#06b6d4' },
        { x: 500, y: 80, label: 'Vector Search', color: '#10b981' },
        { x: 300, y: 220, label: 'Context Assembly', color: '#f59e0b' },
        { x: 500, y: 220, label: 'LLM Generation', color: '#f43f5e' },
      ];

      nodes.forEach(({ x, y, label, color }) => {
        try {
          const fb = fabricModuleRef.current;
          if (!fb) return;
          const rect = new fb.Rect({
            left: x, top: y, width: 140, height: 52,
            fill: color + '20', stroke: color, strokeWidth: 2, rx: 12, ry: 12,
          });
          const text = new fb.Text(label, {
            left: x + 70, top: y + 26, originX: 'center', originY: 'center',
            fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: 600, fill: color,
          });
          canvas.add(rect, text);
          canvas.renderAll();
        } catch {}
      });

      setAiGenerating(false);
      setAiPrompt('');
      setShowAiPanel(false);
    }, 2000);
  };

  const toolbarStyle = {
    position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow)',
    border: '1px solid var(--clay-border)', borderRadius: 20, padding: '6px 8px',
    zIndex: 10,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Whiteboard header */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)',
          flexShrink: 0, zIndex: 20,
        }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>✦ Whiteboard</span>
          <div style={{ flex: 1 }} />

          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setZoom(z => Math.max(50, z - 10))} className="btn-clay" style={{ padding: '6px 10px' }}>
              <ZoomOut size={14} />
            </motion.button>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setZoom(z => Math.min(200, z + 10))} className="btn-clay" style={{ padding: '6px 10px' }}>
              <ZoomIn size={14} />
            </motion.button>
          </div>

          {/* AI button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAiPanel(!showAiPanel)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px',
              borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-primary), #06b6d4)',
              color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            }}
          >
            <Sparkles size={14} />
            Generate with AI
          </motion.button>

          <motion.button whileTap={{ scale: 0.95 }} className="btn-clay" style={{ padding: '6px 12px', fontSize: 12 }}>
            <Share2 size={13} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} className="btn-clay" style={{ padding: '6px 12px', fontSize: 12 }}>
            <Download size={13} />
          </motion.button>
        </div>

        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Central toolbar */}
          <div style={toolbarStyle}>
            {TOOLS.map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleToolClick(id)}
                title={label}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: '1px solid transparent',
                  background: activeTool === id ? 'linear-gradient(135deg, var(--accent-primary), #5b21b6)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: activeTool === id ? 'white' : 'var(--text-secondary)',
                  boxShadow: activeTool === id ? '0 4px 10px rgba(124,58,237,0.35)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={16} />
              </motion.button>
            ))}

            <div style={{ width: 1, height: 28, background: 'var(--clay-border)', margin: '0 2px' }} />

            {/* Undo / Clear */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleUndo} title="Undo" style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <Undo2 size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleClear} title="Clear canvas" style={{ width: 36, height: 36, borderRadius: 10, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-rose)' }}>
              <Trash2 size={16} />
            </motion.button>
          </div>

          {/* Color palette (left side) */}
          <motion.div
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow)',
              border: '1px solid var(--clay-border)', borderRadius: 20,
              padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6, zIndex: 10,
            }}
          >
            {COLORS.map(c => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActiveColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', border: activeColor === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                  background: c, cursor: 'pointer',
                  boxShadow: activeColor === c ? `0 0 0 3px ${c}40` : 'none',
                  outline: c === '#ffffff' ? '1px solid var(--clay-border)' : 'none',
                }}
              />
            ))}
            <div style={{ width: 24, height: 1, background: 'var(--clay-border)', marginTop: 2 }} />
            {STROKE_WIDTHS.map(w => (
              <motion.button
                key={w}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setStrokeWidth(w)}
                style={{
                  width: 24, height: 24, borderRadius: 6, border: 'none',
                  background: strokeWidth === w ? 'var(--accent-primary-light)' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <div style={{ width: Math.min(w * 3, 16), height: w / 2 + 1, borderRadius: 4, background: activeColor }} />
              </motion.button>
            ))}
          </motion.div>

          {/* The Fabric canvas */}
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, cursor: 'auto' }}
          />

          {/* AI Panel */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                style={{
                  position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
                  width: 520, background: 'var(--clay-bg)', boxShadow: 'var(--clay-shadow-lg)',
                  border: '1px solid var(--clay-border)', borderRadius: 24, padding: 20, zIndex: 20,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>AI Diagram Generator</span>
                </div>

                {/* Preset prompts */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                  {AI_PROMPTS.map(p => (
                    <button key={p} onClick={() => setAiPrompt(p)} style={{
                      padding: '5px 10px', borderRadius: 8,
                      border: '1px solid var(--clay-border)', background: 'var(--bg-subtle)',
                      fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-primary-light)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="input-clay"
                    placeholder="Describe what to generate..."
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                    style={{ flex: 1 }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAiGenerate}
                    disabled={aiGenerating}
                    className="btn-clay-primary btn-clay"
                    style={{ padding: '10px 20px', flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {aiGenerating ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Sparkles size={14} />
                      </motion.div>
                    ) : <Sparkles size={14} />}
                    {aiGenerating ? 'Generating...' : 'Generate'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
