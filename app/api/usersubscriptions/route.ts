import { ExecuteSQL } from '@/app/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/app/utilities/getUserIdFromRequest';

export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        var data = await ExecuteSQL('SELECT * FROM user_subscriptions WHERE UserId = $1 ORDER BY id DESC;', [userId]);
        if (data.length > 0)
            return NextResponse.json({ success: true, data: data, status: 200 });
        else 
            return NextResponse.json({ success: false, status: 202 });
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const subscription = await req.json(); 
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ success: false, status: 400 });
        }
        // Check if the subscription already exists
        var checkQuery = 'SELECT * FROM user_subscriptions WHERE endpoint = $1 and UserId = $2;';
        var checkData = await ExecuteSQL(checkQuery, [subscription.endpoint, userId]);
        if (checkData.length > 0) {
            return NextResponse.json({ success: false, status: 409 });
        }
        var sqlQuery = 'INSERT INTO user_subscriptions (UserId, Endpoint, Keys, device_name, origin_url) VALUES ($1, $2, $3, $4, $5);';
        var data = await ExecuteSQL(sqlQuery, [
            userId,
            subscription.endpoint,
            JSON.stringify(subscription.keys),
            subscription.deviceName,
            subscription.originUrl
        ]); 
        if (data.length > 0) {
            return NextResponse.json({ success: true, status: 200 });
        } else {
            return NextResponse.json({ success: false, status: 202 });
        }
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const subscription = await req.json(); 
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ success: false, status: 400 });
        }
        // Check if the subscription already exists
        var checkQuery = 'SELECT * FROM user_subscriptions WHERE endpoint = $1 and UserId = $2;';
        var checkData = await ExecuteSQL(checkQuery, [subscription.endpoint, userId]);
        if (checkData.length === 0) {
            return NextResponse.json({ success: false, status: 409 });
        }
        var sqlQuery = 'DELETE FROM user_subscriptions WHERE UserId = $1 and endpoint = $2;';
        var data = await ExecuteSQL(sqlQuery, [userId, subscription.endpoint]);
        if (data.length > 0) {
            return NextResponse.json({ success: true, status: 200 });
        } else {
            return NextResponse.json({ success: false, status: 202 });
        }
    } catch (err) {
        console.error('request failed:', err);
        return NextResponse.json({ error: 'request failed' }, { status: 500 });
    }
}