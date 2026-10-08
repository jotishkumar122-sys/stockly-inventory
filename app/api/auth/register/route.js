import bcrypt from "bcryptjs";
import db from "@/lib/db"; import { setToken } from "@/lib/auth";
export async function POST(req){
  try{
    const {name,email,password}=await req.json();
    if(!name?.trim()||!/^\S+@\S+\.\S+$/.test(email||"")) return Response.json({error:"Valid name aur email dalo"},{status:400});
    if(!password||password.length<8||!/[A-Za-z]/.test(password)||!/\d/.test(password))
      return Response.json({error:"Password 8+ characters, letter aur number zaroori"},{status:400});
    const users=(await db()).collection("users"), e=email.toLowerCase();
    if(await users.findOne({email:e})) return Response.json({error:"Email already registered"},{status:409});
    const first=(await users.countDocuments())===0;
    const u={name:name.trim(),email:e,password:await bcrypt.hash(password,10),role:first?"admin":"user",createdAt:new Date()};
    u._id=(await users.insertOne(u)).insertedId; await setToken(u);
    return Response.json({ok:true});
  }catch(e){ console.error(e); return Response.json({error:/Mongo|ECONN|ENOTFOUND|querySrv|uri|scheme|auth/i.test(String(e))?"Database connect nahi hua - .env.local me MONGODB_URI check karo":"Server error"},{status:500}); }
}
