'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Settings, User, Bell, Shield, Palette, Brain, Monitor,
  Moon, Sun, ChevronRight, Save, Globe, Keyboard
} from 'lucide-react';

const SECTIONS = [
  { id: 'appearance', icon: Palette, label: 'Appearance' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'ai', icon: Brain, label: 'AI Preferences' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
];

function Toggle({ checked, onChange }) {
  return (
    <motion.div
      onClick={() => onChange(!checked)}
      style={{
        width: 52, height: 28, borderRadius: 100,
        background: checked ? 'linear-gradient(135deg, var(--accent-primary), #06b6d4)' : 'var(--bg-subtle)',
        border: '1px solid var(--clay-border)',
        cursor: 'pointer', position: 'relative', flexShrink: 0,
        boxShadow: checked ? '0 4px 12px rgba(124,58,237,0.3)' : 'inset 2px 2px 6px rgba(0,0,0,0.06)',
        transition: 'background 0.3s, box-shadow 0.3s',
      }}
    >
      <motion.div
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
        style={{
          position: 'absolute', top: 3, width: 20, height: 20,
          borderRadius: '50%', background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      />
    </motion.div>
  );
}

function SettingRow({ label, desc, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0', borderBottom: '1px solid var(--clay-border)',
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [prefs, setPrefs] = useState({
    notifications: true, sounds: false, autoSave: true,
    analyticsShare: false, telemetry: true,
    aiVoice: false, compactMode: false, animations: true,
  });

  const set = (key, val) => setPrefs(p => ({ ...p, [key]: val }));

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <Settings size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Settings</span>
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Section nav */}
          <div style={{
            width: 200, padding: '16px 12px', borderRight: '1px solid var(--clay-border)',
            background: 'var(--bg-raised)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0
          }}>
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSection(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  background: activeSection === id ? 'var(--sidebar-item-active)' : 'transparent',
                  color: activeSection === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: activeSection === id ? 700 : 500,
                  transition: 'all 0.2s', textAlign: 'left', width: '100%',
                }}
              >
                <Icon size={15} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
            {activeSection === 'appearance' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24, color: 'var(--text-primary)' }}>Appearance</h2>

                {/* Theme picker */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Theme</div>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {[
                      { id: 'light', icon: Sun, label: 'Light', bg: '#f0eef8', card: '#ffffff', text: '#1a1033' },
                      { id: 'dark', icon: Moon, label: 'Dark', bg: '#0f0d1a', card: '#1e1b30', text: '#f0edff' },
                    ].map(({ id, icon: Icon, label, bg, card, text }) => (
                      <motion.div
                        key={id}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => id !== theme && toggleTheme()}
                        style={{
                          width: 160, borderRadius: 20, padding: 16, cursor: 'pointer',
                          background: bg, border: `2px solid ${theme === id ? 'var(--accent-primary)' : 'transparent'}`,
                          boxShadow: theme === id ? '0 0 0 4px rgba(124,58,237,0.15), var(--clay-shadow)' : 'var(--clay-shadow-sm)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ width: '100%', height: 70, borderRadius: 12, background: card, marginBottom: 10, boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)' }}>
                          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            <div style={{ height: 6, width: '60%', borderRadius: 4, background: text + '30' }} />
                            <div style={{ height: 5, width: '80%', borderRadius: 4, background: text + '20' }} />
                            <div style={{ height: 5, width: '50%', borderRadius: 4, background: text + '15' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Icon size={14} color={text} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{label}</span>
                          {theme === id && (
                            <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="clay" style={{ borderRadius: 20, padding: '0 20px' }}>
                  <SettingRow label="Compact mode" desc="Reduce spacing in the interface">
                    <Toggle checked={prefs.compactMode} onChange={v => set('compactMode', v)} />
                  </SettingRow>
                  <SettingRow label="Enable animations" desc="Motion and transition effects">
                    <Toggle checked={prefs.animations} onChange={v => set('animations', v)} />
                  </SettingRow>
                  <SettingRow label="Show confidence scores" desc="Display AI reliability indicators">
                    <Toggle checked={true} onChange={() => {}} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeSection === 'profile' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Profile</h2>
                <div className="clay" style={{ borderRadius: 20, padding: 24, marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white' }}>S</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Sourav</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>sourav@example.com</div>
                    <div style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 700, marginTop: 6, padding: '3px 10px', background: 'var(--accent-primary-light)', borderRadius: 100, display: 'inline-block' }}>Free Plan</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[['Full Name', 'Sourav'], ['Email', 'sourav@example.com'], ['Username', '@sourav']].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                      <input className="input-clay" defaultValue={val} />
                    </div>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-clay btn-clay-primary" style={{ marginTop: 20, padding: '12px 28px', fontSize: 14 }}>
                  <Save size={15} /> Save Changes
                </motion.button>
              </motion.div>
            )}

            {activeSection === 'ai' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>AI Preferences</h2>
                <div className="clay" style={{ borderRadius: 20, padding: '0 20px' }}>
                  <SettingRow label="AI Voice Responses" desc="Enable text-to-speech for AI answers">
                    <Toggle checked={prefs.aiVoice} onChange={v => set('aiVoice', v)} />
                  </SettingRow>
                  <SettingRow label="Source-only mode" desc="Only answer from uploaded documents by default">
                    <Toggle checked={false} onChange={() => {}} />
                  </SettingRow>
                  <SettingRow label="Show citation badges" desc="Display grounded answer indicators">
                    <Toggle checked={true} onChange={() => {}} />
                  </SettingRow>
                  <SettingRow label="Auto-generate quiz" desc="Create quizzes after document upload">
                    <Toggle checked={false} onChange={() => {}} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Notifications</h2>
                <div className="clay" style={{ borderRadius: 20, padding: '0 20px' }}>
                  <SettingRow label="Push Notifications" desc="Receive in-app notifications">
                    <Toggle checked={prefs.notifications} onChange={v => set('notifications', v)} />
                  </SettingRow>
                  <SettingRow label="Sound Effects" desc="Play sounds on AI responses">
                    <Toggle checked={prefs.sounds} onChange={v => set('sounds', v)} />
                  </SettingRow>
                  <SettingRow label="Email Digest" desc="Weekly summary of your activity">
                    <Toggle checked={true} onChange={() => {}} />
                  </SettingRow>
                </div>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Security</h2>
                <div className="clay" style={{ borderRadius: 20, padding: '0 20px' }}>
                  <SettingRow label="Two-factor Authentication" desc="Add an extra layer of security">
                    <Toggle checked={false} onChange={() => {}} />
                  </SettingRow>
                  <SettingRow label="Share Analytics" desc="Help improve CollabMind AI">
                    <Toggle checked={prefs.analyticsShare} onChange={v => set('analyticsShare', v)} />
                  </SettingRow>
                  <SettingRow label="Anonymous Telemetry" desc="Usage stats to improve performance">
                    <Toggle checked={prefs.telemetry} onChange={v => set('telemetry', v)} />
                  </SettingRow>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: 20, padding: '11px 20px', borderRadius: 14,
                    background: 'var(--accent-rose-light)', border: '1px solid var(--accent-rose)',
                    color: 'var(--accent-rose)', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <Shield size={14} />
                  Sign Out of All Devices
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
