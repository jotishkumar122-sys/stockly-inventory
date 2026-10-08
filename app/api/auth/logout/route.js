import { cookies } from "next/headers";
export async function POST(){ (await cookies()).delete("t"); return Response.json({ok:true}); }
