import { ExecuteSQL } from '@/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await ExecuteSQL('SELECT * FROM user_settings ORDER BY id DESC;');

        if (data.length > 0)
            return NextResponse.json({ success: true, data: data[0], status: 200 });
        else 
        return NextResponse.json({ success: false, status: 202 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}