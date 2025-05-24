"use server";
import { neon } from "@neondatabase/serverless";

// Use a singleton for the Neon client to avoid creating a new connection on every request (especially in dev)
let sql: any;
if (!(globalThis as any)._neonClient) {
    (globalThis as any)._neonClient = neon(process.env.DATABASE_URL!);
}
sql = (globalThis as any)._neonClient;

export async function getUncompleteTodosBefore(date: string) {
    const data = await ExecuteSQL("SELECT * FROM user_todos where due_date < $1 and status != 'completed';", [date]);
    return data;
}

export async function getAllTodos(userId?: number) {
    if (userId) {
        // Filter todos by userId if provided
        var data = await ExecuteSQL('SELECT ut.id, ut.summary, ut.due_date, ut.status, ut.notes, ut.category, tc.category_name FROM user_todos ut join todos_category tc on ut.category=tc.id WHERE ut.user_id = $1 order by ut.due_date asc;', [userId]);
        return data;
    } else {
        var data = await ExecuteSQL('SELECT ut.id, ut.summary, ut.due_date, ut.status, ut.notes, ut.category, tc.category_name FROM user_todos ut join todos_category tc on ut.category=tc.id order by ut.due_date asc;');
        return data;
    }
}

export async function getUserSubscriptions(userId: number) {
    const data = await ExecuteSQL("SELECT * FROM user_subscriptions where userid = $1;", [userId]);
    return data;
}

export async function ExecuteSQL(query: string, p0: any[] = []) {
    console.log("Executing query:", query, "with parameters:", p0);
    const data = await sql.query(query, p0);
    return data;
}