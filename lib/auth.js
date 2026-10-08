import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
export async function setToken(u){
  const t = jwt.sign({id:u._id.toString(),name:u.name,role:u.role},process.env.JWT_SECRET,{expiresIn:"7d"});
  (await cookies()).set("t",t,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:604800});
}
export async function getUser(){
  try{ return jwt.verify((await cookies()).get("t")?.value,process.env.JWT_SECRET); }catch{ return null; }
}
