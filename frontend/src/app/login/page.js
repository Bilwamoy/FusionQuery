'use client';

import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Github, Chrome, AlertCircle } from 'lucide-react';
import * as THREE from 'three';
import { auth as authApi } from '@/lib/api';

/* ─── 3D Background ─── */
function FloatingBlob({ position, color, speed, distort }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(clock.elapsedTime * speed * 0.4) * 0.3;
      meshRef.current.rotation.y = Math.cos(clock.elapsedTime * speed * 0.3) * 0.4;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} distort={distort} speed={2} roughness={0.2} metalness={0.1} transparent opacity={0.75} />
      </Sphere>
    </Float>
  );
}

function ParticleRing() {
  const ref = useRef();
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.08; });
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 6 + Math.random() * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.06} color="#a78bfa" transparent opacity={0.7} />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#7c3aed" />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#06b6d4" />
      <Stars radius={80} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
      <FloatingBlob position={[-3.5, 1.5, -3]} color="#7c3aed" speed={1.4} distort={0.5} />
      <FloatingBlob position={[3.5, -1.5, -4]} color="#06b6d4" speed={1.1} distort={0.4} />
      <FloatingBlob position={[0.5, 2.5, -5]} color="#f59e0b" speed={0.9} distort={0.35} />
      <FloatingBlob position={[-2, -2.5, -2]} color="#10b981" speed={1.2} distort={0.45} />
      <ParticleRing />
    </>
  );
}

/* ─── Auth Form ─── */
export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (tab === 'login') {
        await authApi.login({ email: form.email, password: form.password });
      } else {
        if (!form.name.trim()) { setError('Full name is required'); setLoading(false); return; }
        await authApi.register({ name: form.name, email: form.email, password: form.password });
      }
      router.push('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '12px 14px',
    borderRadius: 14, border: '1.5px solid rgba(124,58,237,0.2)',
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s',
    color: 'white',
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0615' }}>
      {/* Three.js canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Overlay gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(10,6,21,0.3) 0%, rgba(10,6,21,0.7) 100%)',
      }} />

      {/* Auth card */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.1, 0.64, 1] }}
          style={{
            width: '100%', maxWidth: 420,
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 28,
            padding: '36px 36px 32px',
            boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 16,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(124,58,237,0.5)',
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>CollabMind AI</div>
              <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.9)', fontWeight: 600 }}>Knowledge Workspace</div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 14,
            padding: 4, marginBottom: 28, border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {['login', 'signup'].map((t) => (
              <motion.button
                key={t} onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: tab === t ? 'rgba(124,58,237,0.6)' : 'transparent',
                  color: tab === t ? 'white' : 'rgba(255,255,255,0.5)',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                  boxShadow: tab === t ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </motion.button>
            ))}
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                  borderRadius: 12, background: 'rgba(244,63,94,0.15)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  marginBottom: 16,
                }}
              >
                <AlertCircle size={14} color="#f43f5e" />
                <span style={{ fontSize: 13, color: '#f43f5e', fontWeight: 500 }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OAuth buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { icon: Chrome, label: 'Google' },
              { icon: Github, label: 'GitHub' },
            ].map(({ icon: Icon, label }) => (
              <motion.button
                key={label}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setError('OAuth coming soon. Use email/password for now.')}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '11px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.07)', cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: 13, fontWeight: 600, color: 'white',
                  backdropFilter: 'blur(8px)', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
              >
                <Icon size={16} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <AnimatePresence>
              {tab === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={inputStyle}>
                    <User size={16} color="rgba(167,139,250,0.8)" />
                    <input
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: 14, fontFamily: 'inherit' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={inputStyle}>
              <Mail size={16} color="rgba(167,139,250,0.8)" />
              <input
                type="email" placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: 14, fontFamily: 'inherit' }}
              />
            </div>

            <div style={inputStyle}>
              <Lock size={16} color="rgba(167,139,250,0.8)" />
              <input
                type={showPass ? 'text' : 'password'} placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required minLength={6}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'white', fontSize: 14, fontFamily: 'inherit' }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{
                padding: '13px 0', borderRadius: 14, border: 'none',
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: 'white', fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'opacity 0.2s',
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={16} />
                  </motion.div>
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {tab === 'login' ? 'Sign In to CollabMind' : 'Create Account'}
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 20, lineHeight: 1.6 }}>
            By continuing, you agree to our{' '}
            <span style={{ color: 'rgba(167,139,250,0.8)', cursor: 'pointer' }}>Terms</span> and{' '}
            <span style={{ color: 'rgba(167,139,250,0.8)', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
