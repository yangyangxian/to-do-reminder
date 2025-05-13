import { ExecuteSQL } from '@/dataAccess/dataAccess';
import { FormatDate } from '@/utilities/formatHelper';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await ExecuteSQL('SELECT ut.id, ut.summary, ut.due_date, ut.status, ut.notes, tc.category_name FROM user_todos ut join todos_category tc on ut.category=tc.id order by ut.due_date asc;');
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