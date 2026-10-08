"use client";
import { useState } from "react";
export default function Home(){
  const [reg,setReg]=useState(false),[f,setF]=useState({name:"",email:"",password:""}),[err,setErr]=useState("");
  async function go(e){e.preventDefault();setErr("");
    const r=await fetch(`/api/auth/${reg?"register":"login"}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(f)});
    const d=await r.json(); r.ok?location.href="/dashboard":setErr(d.error);}
  return(<div className="auth card"><h2>📦 Stockly</h2><p>{reg?"Naya account banao":"Login karo"}</p>
    <form onSubmit={go}>{reg&&<input placeholder="Name" value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>}
    <input type="email" placeholder="Email" value={f.email} onChange={e=>setF({...f,email:e.target.value})}/>
    <input type="password" placeholder="Password (8+, letter + number)" value={f.password} onChange={e=>setF({...f,password:e.target.value})}/>
    {err&&<p className="err">{err}</p>}<button style={{width:"100%"}}>{reg?"Register":"Login"}</button></form>
    <p style={{textAlign:"center"}}><a href="#" onClick={e=>{e.preventDefault();setReg(!reg);setErr("")}}>{reg?"Already account hai? Login":"Account nahi hai? Register"}</a></p></div>);
}
