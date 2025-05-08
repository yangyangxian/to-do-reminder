import { ExecuteSQL } from '@/dataAccess/dataAccess';
import { FormatDate } from '@/utilities/formatHelper';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await ExecuteSQL('SELECT * FROM user_to_dos ORDER BY id DESC;');
        const formattedData = data.map((item: any) => ({
            ...item,
            DueDate: item.DueDate ? FormatDate(item.DueDate) : null,
          }));
        
        return NextResponse.json({ success: true, data: formattedData, status: 200 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}