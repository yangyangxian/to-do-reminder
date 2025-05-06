"use server";
import { neon } from "@neondatabase/serverless";

export async function ExecuteSQL(query: string) {
    const sql = neon(process.env.DATABASE_URL!);
    const data = await sql.query(query);
    console.log("data", data);
    return data;
}