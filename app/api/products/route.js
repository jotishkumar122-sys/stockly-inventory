import db from "@/lib/db"; import { getUser } from "@/lib/auth";
const scope=u=>u.role==="admin"?{}:{owner:u.id};
function clean(b){
  const name=(b.name||"").trim(), price=Number(b.price), qty=Number(b.quantity);
  if(!name||isNaN(price)||price<0||!Number.isInteger(qty)||qty<0) return null;
  return {image:typeof b.image==="string"&&b.image.startsWith("data:image/")&&b.image.length<150000?b.image:"",name,category:(b.category||"General").trim(),price,quantity:qty};
}
export async function GET(req){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const p=new URL(req.url).searchParams, q={...scope(u)};
  if(p.get("search")) q.name={$regex:p.get("search").replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),$options:"i"};
  if(p.get("category")) q.category=p.get("category");
  const page=Math.max(1,+p.get("page")||1), size=p.get("all")?1000:8, c=(await db()).collection("products");
  const [items,total,cats]=await Promise.all([c.find(q,{projection:p.get("all")?{image:0}:{}}).sort({createdAt:-1}).skip((page-1)*size).limit(size).toArray(),c.countDocuments(q),c.distinct("category",scope(u))]);
  return Response.json({items,total,pages:Math.ceil(total/size)||1,cats});
}
export async function POST(req){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const v=clean(await req.json()); if(!v) return Response.json({error:"Invalid input"},{status:400});
  await (await db()).collection("products").insertOne({...v,owner:u.id,createdAt:new Date(),updatedAt:new Date()});
  return Response.json({ok:true},{status:201});
}
