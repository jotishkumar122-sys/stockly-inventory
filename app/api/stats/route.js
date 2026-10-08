import db from "@/lib/db"; import { getUser } from "@/lib/auth";
export async function GET(){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const m=u.role==="admin"?{}:{owner:u.id}, all=await (await db()).collection("products").find(m).toArray();
  return Response.json({
    total:all.length, value:all.reduce((s,p)=>s+p.price*p.quantity,0),
    low:all.filter(p=>p.quantity<5).length, categories:new Set(all.map(p=>p.category)).size,
    cats:Object.entries(all.reduce((m,p)=>(m[p.category]=(m[p.category]||0)+p.price*p.quantity,m),{})).map(([name,value])=>({name,value})),lowItems:all.filter(p=>p.quantity<5).slice(0,5).map(p=>p.name+" ("+p.quantity+")"),recent:[...all].sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,5).map(p=>({name:p.name,at:p.updatedAt}))
  });
}
