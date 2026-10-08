import { MongoClient } from "mongodb";
export default function db(){
  if(!global._m) global._m = new MongoClient(process.env.MONGODB_URI).connect();
  return global._m.then(c=>c.db("stockly"));
}
