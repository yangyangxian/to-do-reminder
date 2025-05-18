"use server";
import { FormatDate } from "@/app/utilities/formatHelper";
import { neon } from "@neondatabase/serverless";

export async function getTodayTodos() {
    const data = await ExecuteSQL("SELECT * FROM user_todos where due_date = $1;", [FormatDate(new Date())]);
    return data;
}

export async function getOverdueTodos() {
    const data = await ExecuteSQL("SELECT * FROM user_todos where due_date < $1 and status != 'completed';", [FormatDate(new Date())]);
    return data;
}

export async function getAllTodos() {
    var data = await ExecuteSQL('SELECT ut.id, ut.summary, ut.due_date, ut.status, ut.notes, ut.category, tc.category_name FROM user_todos ut join todos_category tc on ut.category=tc.id order by ut.due_date asc;');
    return data;
}

export async function getUserSubscriptions() {
    const data = await ExecuteSQL("SELECT * FROM user_subscriptions where userid = 1;");
    return data;
}

export async function ExecuteSQL(query: string, p0: any[] = []) {
    const sql = neon(process.env.DATABASE_URL!);
    console.log("Executing query:", query, "with parameters:", p0);
    const data = await sql.query(query, p0);
    return data;
}