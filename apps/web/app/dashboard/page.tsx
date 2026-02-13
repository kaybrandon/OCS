'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/dashboard/portfolio`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()).then(setData);
  }, []);
  if (!data) return <p>Loading dashboard...</p>;
  return <div><h1>Portfolio Dashboard</h1><p>Total Revenue: ${data.totals.totalRevenue}</p><div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12}}>{data.tiles.map((t:any)=><div key={t.company.id} style={{background:'#fff', padding:12}}><h3>{t.company.name}</h3><p>GM Score: {t.gmScore || 'N/A'}</p><p>Founder 7d: {t.founderMinutes7d}m</p><p>Status: {t.company.status}</p><Link href={`/company/${t.company.id}`}>Open</Link></div>)}</div></div>;
}
