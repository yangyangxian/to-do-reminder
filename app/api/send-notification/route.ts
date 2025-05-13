import { getOverdueTodos, getTodayTodos, getUserSubscriptions } from '@/dataAccess/dataAccess';
import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

webPush.setVapidDetails(
  'mailto:yangyang07271013@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET() {
  try {
    const todosToday = await getTodayTodos();
    const todosOverdue = await getOverdueTodos();
    if (todosToday.length === 0 && todosOverdue.length === 0) {
      return NextResponse.json({ message: "no todos needs to sent today." });
    }

    var subscriptions = await getUserSubscriptions();

    todosToday.forEach(element => {
        sendNotification('You have a todo due today:' + element.summary, subscriptions);
    });

    var overDueBody = 'You have ' + todosOverdue.length +' overdue todos';
    sendNotification(overDueBody, subscriptions);
  } catch (err) {
    console.error('request failed:', err);
    return NextResponse.json({ error: 'request failed' }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true });
}

async function sendNotification(body: string, subscriptions: Array<Record<string, any>>) {
  try {
    subscriptions.forEach((sub: Record<string, any>) => {
      if (sub.endpoint && sub.keys && JSON.parse(sub.keys).p256dh && JSON.parse(sub.keys).auth) {
        const pushSubscription = {
          endpoint: sub.endpoint,
          expirationTime: null, 
          keys: {
            p256dh: JSON.parse(sub.keys).p256dh,
            auth: JSON.parse(sub.keys).auth, 
          },
        };
    
        const payload = JSON.stringify({
          title: 'To-do Reminder',
          body: body,
          url: '/',
        });
    
        webPush.sendNotification(pushSubscription, payload).catch((err) => {
          console.error('Failed to send notification:', err);
        });

      } else {
          console.error('Invalid subscription object:', sub);
      }
    });
    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}