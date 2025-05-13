import { ExecuteSQL, getAllTodos } from '@/dataAccess/dataAccess';
import { FormatDate } from '@/utilities/formatHelper';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await getAllTodos();
        const formattedData = data.map((item: any) => ({
            ...item,
            due_date: item.due_date ? FormatDate(item.due_date) : null,
        }));
        
        return NextResponse.json({ success: true, data: formattedData, status: 200 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}