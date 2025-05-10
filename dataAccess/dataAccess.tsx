"use server";
import { neon } from "@neondatabase/serverless";

export async function ExecuteSQL(query: string, p0: any[] = []) {
    const sql = neon(process.env.DATABASE_URL!);
    console.log("Executing query:", query, "with parameters:", p0);
    const data = await sql.query(query, p0);
    return data;
}