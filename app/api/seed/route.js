import db from "@/lib/db"; import { getUser } from "@/lib/auth";
const D=[["iPhone 15","Mobiles",285000,12],["Galaxy S24","Mobiles",240000,3],["MacBook Air","Laptops",330000,6],["Dell XPS 13","Laptops",295000,2],["AirPods Pro","Audio",58000,25],["Sony WH-1000XM5","Audio",85000,4],["Logitech MX Master","Accessories",22000,18],["USB-C Cable","Accessories",1500,60],["Samsung 27in Monitor","Displays",62000,9],["iPad 10th Gen","Tablets",135000,7],["Smart Watch","Wearables",32000,1],["Power Bank 20000mAh","Accessories",6500,30]];
export async function POST(){
  const u=await getUser(); if(!u) return Response.json({error:"Unauthorized"},{status:401});
  const n=Date.now();
  await (await db()).collection("products").insertMany(D.map(([name,category,price,quantity],i)=>({name,category,price,quantity,owner:u.id,createdAt:new Date(n-i*3600e3),updatedAt:new Date(n-i*3600e3)})));
  return Response.json({ok:true});
}
