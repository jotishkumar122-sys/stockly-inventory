import { ObjectId } from "mongodb";
import db from "@/lib/db"; import { getUser } from "@/lib/auth";
export async function GET(){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const c=(await db()).collection("orders"), m=u.role==="admin"?{}:{owner:u.id};
  const [orders,agg]=await Promise.all([c.find(m).sort({createdAt:-1}).limit(5).toArray(),c.aggregate([{$match:m},{$group:{_id:null,t:{$sum:"$total"}}}]).toArray()]);
  return Response.json({orders,revenue:agg[0]?.t||0});
}
export async function POST(req){
  try{
    const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
    const {productId,qty,method}=await req.json(), n=Number(qty);
    if(!ObjectId.isValid(productId)||!Number.isInteger(n)||n<1||!["Card","JazzCash","Cash"].includes(method)) return Response.json({error:"Invalid input"},{status:400});
    const d=await db();
    const r=await d.collection("products").findOneAndUpdate({_id:new ObjectId(productId),...(u.role==="admin"?{}:{owner:u.id}),quantity:{$gte:n}},{$inc:{quantity:-n},$set:{updatedAt:new Date()}},{returnDocument:"after"});
    if(!r) return Response.json({error:"Stock kam hai ya product nahi mila"},{status:400});
    const ref="ORD-"+Date.now().toString(36).toUpperCase();
    await d.collection("orders").insertOne({ref,name:r.name,qty:n,total:r.price*n,method,status:"paid",owner:r.owner,createdAt:new Date()});
    if(r.quantity<5&&process.env.RESEND_API_KEY){
      try{
        const o=await d.collection("users").findOne({_id:new ObjectId(r.owner)});
        if(o) await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},
          body:JSON.stringify({from:"Stockly <onboarding@resend.dev>",to:[o.email],subject:"Low stock: "+r.name,html:`<p><b>${String(r.name).replace(/</g,"&lt;")}</b> ka stock sirf ${r.quantity} reh gaya hai.</p>`})});
      }catch(e){console.error("email",e);}
    }
    return Response.json({ok:true,ref});
  }catch(e){console.error(e);return Response.json({error:"Server error"},{status:500});}
}
