import db from "@/lib/db"; import { getUser } from "@/lib/auth";
export async function GET(){
  const u=await getUser(); if(!u||u.role!=="admin") return Response.json({error:"Forbidden"},{status:403});
  return Response.json(await (await db()).collection("users").find({},{projection:{password:0}}).sort({createdAt:-1}).toArray());
}
