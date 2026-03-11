'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Brain, Clock, Star, Target, Zap } from 'lucide-react';

const engagementData = [
  { day: 'Mon', queries: 24, time: 45 }, { day: 'Tue', queries: 38, time: 62 },
  { day: 'Wed', queries: 31, time: 55 }, { day: 'Thu', queries: 52, time: 88 },
  { day: 'Fri', queries: 42, time: 71 }, { day: 'Sat', queries: 18, time: 30 },
  { day: 'Sun', queries: 27, time: 48 },
];

const quizData = [
  { topic: 'RAG', score: 87 }, { topic: 'Vectors', score: 74 },
  { topic: 'LLMs', score: 91 }, { topic: 'Attention', score: 62 },
  { topic: 'Fine-tuning', score: 78 },
];

const topicData = [
  { name: 'RAG Systems', value: 34, color: '#7c3aed' },
  { name: 'Vector DBs', value: 22, color: '#06b6d4' },
  { name: 'LLMs', value: 28, color: '#f59e0b' },
  { name: 'Other', value: 16, color: '#10b981' },
];

const statsCards = [
  { icon: Brain, label: 'Queries Made', value: '232', delta: '+18%', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Clock, label: 'Study Time', value: '14.2h', delta: '+32%', color: '#06b6d4', bg: '#ecfeff' },
  { icon: Target, label: 'Quiz Accuracy', value: '84%', delta: '+7%', color: '#10b981', bg: '#ecfdf5' },
  { icon: Star, label: 'Topics Mastered', value: '12', delta: '+3', color: '#f59e0b', bg: '#fffbeb' },
];

function StatCard({ icon: Icon, label, value, delta, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="clay-lift clay"
      style={{ padding: '20px 22px', borderRadius: 20, display: 'flex', gap: 16, alignItems: 'center' }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 16, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginTop: 3 }}>{delta} this week</div>
      </div>
    </motion.div>
  );
}

const TOOLTIP_STYLE = {
  background: 'var(--clay-bg)', border: '1px solid var(--clay-border)',
  borderRadius: 12, boxShadow: 'var(--clay-shadow)', fontSize: 12,
  color: 'var(--text-primary)',
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)', overflow: 'hidden' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--clay-border)', flexShrink: 0
        }}>
          <TrendingUp size={18} color="var(--accent-primary)" />
          <span style={{ fontWeight: 800, fontSize: 16 }}>Analytics</span>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Last 7 days</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {statsCards.map((card, i) => (
              <motion.div key={i} transition={{ delay: i * 0.08 }}>
                <StatCard {...card} />
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Engagement area chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="clay"
              style={{ padding: 20, borderRadius: 20 }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>Weekly Engagement</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Area type="monotone" dataKey="queries" stroke="#7c3aed" strokeWidth={2} fill="url(#queryGrad)" name="Queries" />
                  <Area type="monotone" dataKey="time" stroke="#06b6d4" strokeWidth={2} fill="url(#timeGrad)" name="Min Spent" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Topic distribution pie */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="clay"
              style={{ padding: 20, borderRadius: 20 }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>Topic Focus</div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={topicData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {topicData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 8 }}>
                {topicData.map(({ name, value, color }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{name}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quiz performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="clay"
            style={{ padding: 20, borderRadius: 20, marginBottom: 16 }}
          >
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16, color: 'var(--text-primary)' }}>Quiz Performance by Topic</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={quizData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-border)" vertical={false} />
                <XAxis dataKey="topic" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {quizData.map((entry, index) => (
                    <Cell key={index}
                      fill={entry.score >= 80 ? '#10b981' : entry.score >= 65 ? '#f59e0b' : '#f43f5e'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Score legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11 }}>
              {[['#10b981', 'Mastery (≥80%)'], ['#f59e0b', 'Developing (65-79%)'], ['#f43f5e', 'Needs Practice (<65%)']].map(([color, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
