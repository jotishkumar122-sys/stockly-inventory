"use client";
import { useEffect, useState, useCallback } from "react";
const E={name:"",category:"",price:"",quantity:"",image:""}, J={"Content-Type":"application/json"}, R=n=>"Rs "+Number(n).toLocaleString();
export default function Dash(){
  const [me,setMe]=useState(null),[st,setSt]=useState(null),[d,setD]=useState({items:[],pages:1,cats:[]}),[users,setUsers]=useState([]);
  const [search,setSearch]=useState(""),[cat,setCat]=useState(""),[page,setPage]=useState(1),[f,setF]=useState(E),[edit,setEdit]=useState(null),[err,setErr]=useState(""),[msg,setMsg]=useState(""),[tab,setTab]=useState("products"),[dark,setDark]=useState(false);
  const [sell,setSell]=useState(null),[sq,setSq]=useState(1),[pm,setPm]=useState("Card"),[paying,setPaying]=useState(false),[ord,setOrd]=useState({orders:[],revenue:0});
  const T=m=>{setMsg(m);setTimeout(()=>setMsg(""),2500)};
  const load=useCallback(async()=>{
    const [s,p]=await Promise.all([fetch("/api/stats"),fetch(`/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(cat)}&page=${page}`)]);
    if(s.status===401){location.href="/";return;}
    setSt(await s.json()); setD(await p.json());
    const o=await fetch("/api/orders"); if(o.ok)setOrd(await o.json());
  },[search,cat,page]);
  useEffect(()=>{fetch("/api/auth/me").then(r=>r.ok?r.json():(location.href="/",null)).then(setMe)},[]);
  useEffect(()=>{load()},[load]);
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light"},[dark]);
  useEffect(()=>{if(tab==="users")fetch("/api/users").then(r=>r.ok?r.json():[]).then(setUsers)},[tab]);
  async function save(e){e.preventDefault();setErr("");
    const r=await fetch(edit?`/api/products/${edit}`:"/api/products",{method:edit?"PUT":"POST",headers:J,body:JSON.stringify(f)});
    if(!r.ok){setErr((await r.json()).error);return;} T(edit?"Product updated ✅":"Product added ✅");setF(E);setEdit(null);load();}
  async function del(id){if(confirm("Delete karna hai?")){await fetch(`/api/products/${id}`,{method:"DELETE"});T("Deleted 🗑️");load();}}
  async function seed(){await fetch("/api/seed",{method:"POST"});T("Demo data load ho gaya 🎉");load();}
  async function csv(){const {items}=await (await fetch("/api/products?all=1")).json();
    const t=["Name,Category,Price,Quantity",...items.map(p=>`"${p.name}","${p.category}",${p.price},${p.quantity}`)].join("\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"text/csv"}));a.download="inventory.csv";a.click();T("CSV download ho gayi 📄");}
  function pick(e){const file=e.target.files[0];if(!file)return;const im=new Image();im.onload=()=>{const c=document.createElement("canvas"),s=Math.min(1,200/Math.max(im.width,im.height));c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);setF(x=>({...x,image:c.toDataURL("image/jpeg",.7)}))};im.src=URL.createObjectURL(file);}
  async function pay(){setPaying(true);await new Promise(r=>setTimeout(r,1200));const r=await fetch("/api/orders",{method:"POST",headers:J,body:JSON.stringify({productId:sell._id,qty:sq,method:pm})});const j=await r.json();setPaying(false);if(!r.ok){T(j.error);return;}setSell(null);setSq(1);T("Payment successful ✅ Ref: "+j.ref);load();}
  async function out(){await fetch("/api/auth/logout",{method:"POST"});location.href="/";}
  if(!me||!st) return <div className="wrap">Loading...</div>;
  const k=x=>e=>setF({...f,[x]:e.target.value}), max=Math.max(1,...st.cats.map(c=>c.value));
  const B=q=>q<5?["lo","Low"]:q<15?["md","Medium"]:["in","In stock"];
  return(<div className="wrap">
    <div className="nav"><h2 style={{margin:0}}>📦 Stockly</h2>
      <div className="tabs"><button className={tab==="products"?"on":""} onClick={()=>setTab("products")}>Products</button>
        {me.role==="admin"&&<button className={tab==="users"?"on":""} onClick={()=>setTab("users")}>👑 Users</button>}
        <button onClick={()=>setDark(!dark)}>{dark?"☀️":"🌙"}</button><button className="s" onClick={out}>Logout</button></div></div>
    <div className="hero"><h2 style={{margin:0}}>Welcome, {me.name} 👋</h2><p style={{margin:"6px 0 0",opacity:.9}}>{me.role==="admin"?"Admin – aap sabka inventory dekh sakte ho.":"Apna inventory yahan manage karo."}</p></div>
    <div className="grid">{[["📦 Products",st.total],["💰 Stock Value",R(st.value)],["⚠️ Low Stock",st.low],["🗂️ Categories",st.categories],["💵 Revenue",R(ord.revenue)]].map(([a,b])=><div key={a} className="card stat"><span>{a}</span><b>{b}</b></div>)}</div>
    {tab==="users"?<div className="card"><h3>Registered Users</h3><div className="t"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>
      {users.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></div>:<>
    <div className="row" style={{alignItems:"stretch"}}>
      <div className="card"><h3>Stock value by category</h3>{st.cats.length?st.cats.map(c=><div key={c.name}><small>{c.name} — {R(c.value)}</small><div className="bg"><div className="bar" style={{width:c.value/max*100+"%"}}/></div></div>):<p>Data nahi hai.</p>}</div>
      <div className="card"><h3>⚠️ Low stock alerts</h3>{st.lowItems.length?st.lowItems.map(x=><p key={x}>• {x}</p>):<p>Sab theek hai ✅</p>}<h3>Recent activity</h3>{st.recent.map((r,i)=><p key={i}>• {r.name} <small>{new Date(r.at).toLocaleString()}</small></p>)}<h3>Recent sales</h3>{ord.orders.length?ord.orders.map(o=><p key={o._id}>• {o.name} ×{o.qty} — {R(o.total)} <small>({o.method})</small></p>):<p>Abhi koi sale nahi.</p>}</div></div>
    <div className="card"><h3>{edit?"✏️ Edit Product":"➕ Add Product"}</h3><form onSubmit={save} className="row">
      <input placeholder="Name" value={f.name} onChange={k("name")}/><input placeholder="Category" value={f.category} onChange={k("category")}/>
      <input type="number" placeholder="Price" value={f.price} onChange={k("price")}/><input type="number" placeholder="Qty" value={f.quantity} onChange={k("quantity")}/>
      <input type="file" accept="image/*" onChange={pick}/>{f.image&&<img alt="" src={f.image} width="40" height="40" style={{borderRadius:8,objectFit:"cover",flex:"none",minWidth:0}}/>}<button>{edit?"Update":"Add"}</button>{edit&&<button type="button" className="s" onClick={()=>{setEdit(null);setF(E)}}>Cancel</button>}</form>{err&&<p className="err">{err}</p>}</div>
    <div className="card"><div className="row"><input placeholder="🔍 Search..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/>
      <select value={cat} onChange={e=>{setCat(e.target.value);setPage(1)}}><option value="">All categories</option>{d.cats.map(c=><option key={c}>{c}</option>)}</select>
      <button className="s" onClick={csv}>⬇️ CSV</button></div>
      <div className="t"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Qty</th><th>Status</th><th></th></tr></thead><tbody>
      {d.items.map(p=>{const[c,l]=B(p.quantity);return <tr key={p._id}><td>{p.image&&<img alt="" src={p.image} width="32" height="32" style={{borderRadius:6,objectFit:"cover",verticalAlign:"middle",marginRight:8}}/>}{p.name}</td><td>{p.category}</td><td>{R(p.price)}</td><td>{p.quantity}</td><td><span className={"badge "+c}>{l}</span></td>
        <td><button disabled={p.quantity<1} onClick={()=>{setSell(p);setSq(1)}}>💳 Sell</button> <button className="s" onClick={()=>{setEdit(p._id);setF({name:p.name,category:p.category,price:p.price,quantity:p.quantity,image:p.image||""});scrollTo(0,0)}}>Edit</button> <button className="d" onClick={()=>del(p._id)}>Delete</button></td></tr>})}
      {!d.items.length&&<tr><td colSpan="6">Koi product nahi mila. <button onClick={seed}>✨ Demo data load karo</button></td></tr>}</tbody></table></div>
      <div className="row" style={{marginTop:12}}><button className="s" disabled={page<=1} onClick={()=>setPage(page-1)}>← Prev</button><span style={{textAlign:"center"}}>Page {page}/{d.pages}</span><button className="s" disabled={page>=d.pages} onClick={()=>setPage(page+1)}>Next →</button></div></div></>}
    {sell&&<div style={{position:"fixed",inset:0,background:"#0008",display:"grid",placeItems:"center",zIndex:8}}><div className="card" style={{width:340,maxWidth:"92vw"}}><h3>💳 Sell: {sell.name}</h3><p>Stock: {sell.quantity} · {R(sell.price)} each</p><input type="number" min="1" max={sell.quantity} value={sq} onChange={e=>setSq(Math.max(1,Math.min(sell.quantity,+e.target.value||1)))}/><br/><br/><select value={pm} onChange={e=>setPm(e.target.value)}><option>Card</option><option>JazzCash</option><option>Cash</option></select><h2>Total: {R(sq*sell.price)}</h2><p><small>Mock payment – koi asli paisa nahi katta.</small></p><div className="row"><button disabled={paying} onClick={pay}>{paying?"Processing...":"Pay now"}</button><button className="s" onClick={()=>setSell(null)}>Cancel</button></div></div></div>}
    {msg&&<div className="toast">{msg}</div>}</div>);
}
