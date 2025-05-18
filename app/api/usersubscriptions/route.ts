import { ExecuteSQL } from '@/app/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        var data = await ExecuteSQL('SELECT * FROM user_subscriptions ORDER BY id DESC;');

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
        const subscription = await req.json(); 
        console.log('subscription:', subscription);
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ success: false, status: 400 });
        }

        // Check if the subscription already exists
        var checkQuery = 'SELECT * FROM user_subscriptions WHERE endpoint = $1 and UserId = 1;';
        var checkData = await ExecuteSQL(checkQuery, [subscription.endpoint]);
        if (checkData.length > 0) {
            console.log('Subscription already exists:', checkData[0]);
            return NextResponse.json({ success: false, status: 409 });
        }

        var sqlQuery = 'INSERT INTO user_subscriptions (UserId, Endpoint, Keys) VALUES (1, $1, $2);';

        var data = await ExecuteSQL(sqlQuery, [
            subscription.endpoint,
            JSON.stringify(subscription.keys)
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
        const subscription = await req.json(); 
        console.log('subscription:', subscription);
        if (!subscription || !subscription.endpoint || !subscription.keys) {
            return NextResponse.json({ success: false, status: 400 });
        }

        // Check if the subscription already exists
        var checkQuery = 'SELECT * FROM user_subscriptions WHERE endpoint = $1;';
        var checkData = await ExecuteSQL(checkQuery, [subscription.endpoint]);
        if (checkData.length === 0) {
            console.log('Subscription does not exist:', checkData[0]);
            return NextResponse.json({ success: false, status: 409 });
        }

        var sqlQuery = 'DELETE FROM user_subscriptions WHERE UserId = 1 and endpoint = $1;';
        var data = await ExecuteSQL(sqlQuery, [subscription.endpoint]);
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