import { getOverdueTodos, getTodayTodos, getUserSubscriptions } from '@/app/dataAccess/dataAccess';
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

    const subscriptions = await getUserSubscriptions();

    // Send notifications for today's todos
    await Promise.all(
      todosToday.map(element =>
        sendNotification('You have a todo due today:' + element.summary, subscriptions)
      )
    );

    // Send notification for overdue todos
    if (todosOverdue.length > 0) {
      const overDueBody = 'You have ' + todosOverdue.length + ' overdue todos';
      await sendNotification(overDueBody, subscriptions);
    }
  } catch (err) {
    console.error('request failed:', err);
    return NextResponse.json({ error: 'request failed' }, { status: 500 });
  }
  
  return NextResponse.json({ ok: true });
}

async function sendNotification(body: string, subscriptions: Array<Record<string, any>>) {
  try {
    const results = await Promise.all(
      subscriptions.map(async (sub: Record<string, any>) => {
        try {
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

            const options = {
              TTL: 60, // in seconds
              urgency: 'high' as webPush.Urgency, // low, normal, high, or very-low
            };

            await webPush.sendNotification(pushSubscription, payload, options);
            return { success: true };
          } else {
            console.error('Invalid subscription object:', sub);
            return { success: false, error: 'Invalid subscription object' };
          }
        } catch (err) {
          console.error('Failed to send notification:', err);
          return { success: false, error: err };
        }
      })
    );
    console.log('Notification send results:', results);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}