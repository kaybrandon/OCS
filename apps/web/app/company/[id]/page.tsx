'use client';
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useEffect, useState } from 'react';

const tabs = ['Overview','Workflows','EOS','GM Score','Culture','Financials','Founder Time','Alerts'];

export default function CompanyDetail({ params }: any) {
  const [tab, setTab] = useState('Overview');
  const [fin, setFin] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    fetch(`${api}/companies/${params.id}/financial-snapshots`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()).then(setFin);
    fetch(`${api}/companies/${params.id}/workflows`, { headers: { Authorization: `Bearer ${token}` }}).then(r=>r.json()).then(setWorkflows);
  }, [params.id]);

  return <div><h1>Company Detail</h1><div>{tabs.map(t => <button key={t} onClick={()=>setTab(t)}>{t}</button>)}</div>
  {tab==='Overview' && <div style={{width:'100%', height:280, background:'#fff'}}><ResponsiveContainer><LineChart data={fin.map(f=>({name:new Date(f.period_end).toLocaleDateString(), rev:f.revenue, margin:f.net_margin_pct}))}><XAxis dataKey='name'/><YAxis/><Line dataKey='rev'/><Line dataKey='margin'/></LineChart></ResponsiveContainer></div>}
  {tab==='Workflows' && <div>{workflows.map((w:any)=><div key={w.id} style={{background:'#fff',marginTop:8,padding:8}}><b>{w.title}</b><table><tbody>{(w.steps||[]).map((s:any)=><tr key={s.id}><td>{s.step_order}</td><td>{s.title}</td><td>{s.owner_role}</td><td>{s.expected_output}</td><td>{s.escalation_role}</td></tr>)}</tbody></table></div>)}</div>}
  </div>;
}
