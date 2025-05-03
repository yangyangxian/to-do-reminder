import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:yangyang07271013@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const subscription = await req.json(); // Parse the subscription object from the request body

    const payload = JSON.stringify({
      title: 'Hello from Next.js',
      body: '这是一条推送消息',
      url: '/',
    });

    await webPush.sendNotification(subscription, payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('推送失败:', err);
    return NextResponse.json({ error: '推送失败' }, { status: 500 });
  }
}
