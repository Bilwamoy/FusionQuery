'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Processing login...');
    const { syncFromStorage } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');

        if (!token) {
            setStatus('Authentication failed — no token received.');
            setTimeout(() => router.push('/login'), 2000);
            return;
        }

        // Store the JWT token
        localStorage.setItem('collabmind_token', token);

        // Fetch the full user profile using the token
        fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to verify token');
                return res.json();
            })
            .then((user) => {
                localStorage.setItem('collabmind_user', JSON.stringify(user));
                syncFromStorage();
                setStatus('Login successful! Redirecting...');
                router.push('/');
            })
            .catch(() => {
                // Token was invalid — clean up and redirect to login
                localStorage.removeItem('collabmind_token');
                localStorage.removeItem('collabmind_user');
                setStatus('Authentication failed. Redirecting to login...');
                setTimeout(() => router.push('/login'), 2000);
            });
    }, [searchParams, router]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0615',
                color: 'white',
                fontFamily: 'inherit',
            }}
        >
            <div style={{ textAlign: 'center' }}>
                {/* Spinner */}
                <div
                    style={{
                        width: 48,
                        height: 48,
                        border: '3px solid rgba(124,58,237,0.2)',
                        borderTop: '3px solid #7c3aed',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 24px',
                    }}
                />
                <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                    {status}
                </p>
            </div>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0a0615',
                        color: 'white',
                    }}
                >
                    <p>Loading...</p>
                </div>
            }
        >
            <CallbackHandler />
        </Suspense>
    );
}
