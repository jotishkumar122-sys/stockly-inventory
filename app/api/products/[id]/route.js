import { ObjectId } from "mongodb";
import db from "@/lib/db"; import { getUser } from "@/lib/auth";
const q=(u,id)=>({_id:ObjectId.isValid(id)?new ObjectId(id):null,...(u.role==="admin"?{}:{owner:u.id})});
function clean(b){const name=(b.name||"").trim(),price=Number(b.price),qty=Number(b.quantity);
  if(!name||isNaN(price)||price<0||!Number.isInteger(qty)||qty<0) return null;
  return {image:typeof b.image==="string"&&b.image.startsWith("data:image/")&&b.image.length<150000?b.image:"",name,category:(b.category||"General").trim(),price,quantity:qty};}
export async function PUT(req,{params}){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const v=clean(await req.json()); if(!v) return Response.json({error:"Invalid input"},{status:400});
  await (await db()).collection("products").updateOne(q(u,(await params).id),{$set:{...v,updatedAt:new Date()}});
  return Response.json({ok:true});
}
export async function DELETE(_,{params}){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  await (await db()).collection("products").deleteOne(q(u,(await params).id));
  return Response.json({ok:true});
}
