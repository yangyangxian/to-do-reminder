import { ExecuteSQL } from '@/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await ExecuteSQL('SELECT * FROM user_to_dos ORDER BY id DESC;');

        return NextResponse.json({ success: true, data: data, status: 200 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}