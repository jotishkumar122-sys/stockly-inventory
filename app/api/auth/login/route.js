import bcrypt from "bcryptjs";
import db from "@/lib/db"; import { setToken } from "@/lib/auth";
export async function POST(req){
  try{
    const {email,password}=await req.json();
    const u=await (await db()).collection("users").findOne({email:(email||"").toLowerCase()});
    if(!u||!(await bcrypt.compare(password||"",u.password))) return Response.json({error:"Email ya password galat hai"},{status:401});
    await setToken(u); return Response.json({ok:true});
  }catch(e){ console.error(e); return Response.json({error:/Mongo|ECONN|ENOTFOUND|querySrv|uri|scheme|auth/i.test(String(e))?"Database connect nahi hua - .env.local me MONGODB_URI check karo":"Server error"},{status:500}); }
}
