import { ExecuteSQL, getAllTodos } from '@/app/dataAccess/dataAccess';
import dayjs from 'dayjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await getAllTodos();
        const formattedData = data.map((item: any) => ({
            ...item,
            due_date: item.due_date ? dayjs(item.due_date).format("YYYY/MM/DD") : null,
        }));
        
        return NextResponse.json({ success: true, data: formattedData, status: 200 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Insert new to-do into the database
        const sql = `INSERT INTO user_todos (summary, due_date, category, status) VALUES ($1, $2, $3, $4)`;
        await ExecuteSQL(sql, [body.summary, body.dueDate, body.category, body.status]);
        return NextResponse.json({ success: true, message: 'To-do created' }, { status: 201 });
    } catch (err) {
        console.error('Failed to create to-do:', err);
        return NextResponse.json({ error: 'Failed to create to-do' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('body:', body);
        if (!body.id) {
            return NextResponse.json({ error: 'Missing to-do id' }, { status: 400 });
        }
        const sql = `UPDATE user_todos SET summary = $1, due_date = $2, category = $3, status = $4 WHERE id = $5`;
        await ExecuteSQL(sql, [body.summary, dayjs(body.dueDate).format("YYYY-MM-DD"), body.category, body.status, body.id]);
        return NextResponse.json({ success: true, message: 'To-do updated' }, { status: 200 });
    } catch (err) {
        console.error('Failed to update to-do:', err);
        return NextResponse.json({ error: 'Failed to update to-do' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.id) {
            return NextResponse.json({ error: 'Missing to-do id' }, { status: 400 });
        }
        const sql = `DELETE FROM user_todos WHERE id = $1`;
        await ExecuteSQL(sql, [body.id]);
        return NextResponse.json({ success: true, message: 'To-do deleted' }, { status: 200 });
    } catch (err) {
        console.error('Failed to delete to-do:', err);
        return NextResponse.json({ error: 'Failed to delete to-do' }, { status: 500 });
    }
}