'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('founder@ocs.local');
  const [password, setPassword] = useState('founder123');
  const [error, setError] = useState('');
  const router = useRouter();

  async function login() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })});
    if (!res.ok) return setError('Invalid credentials');
    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    router.push('/dashboard');
  }

  return <div style={{maxWidth:360, margin:'80px auto', background:'#fff', padding:20}}><h1>OCS Login</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email' /><input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='password' /><button onClick={login}>Login</button><p>{error}</p></div>;
}
