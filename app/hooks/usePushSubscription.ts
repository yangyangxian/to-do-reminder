import { useState, useEffect } from 'react';

export function usePushSubscription() {
  const [subscribed, setSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Fetch and check subscription on mount
  useEffect(() => {
    async function checkSubscription() {
      try {
        const res = await fetch('/api/usersubscriptions');
        const data = await res.json();
        if (!data.success) return;
        const savedSubs: Array<{ endpoint: string }> = data.data;
        if (!savedSubs || savedSubs.length === 0) return;
        const registration = await navigator.serviceWorker.ready;
        let localSub = await registration.pushManager.getSubscription();
        if (!localSub) return;
        if (savedSubs.some(item => item.endpoint === localSub.endpoint)) {
          setSubscribed(true);
          setSubscription(localSub);
        } else {
          setSubscribed(false);
          setSubscription(null);
        }
      } catch (err) {
        setSubscribed(false);
        setSubscription(null);
      }
    }
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      checkSubscription();
    }
  }, []);

  // Handler for subscribe/unsubscribe
  const handleSubscribe = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setNotifLoading(true);
      const checked = event.target.checked;
      if (!checked) {
        setSubscribed(false);
        if (subscription) {
          await fetch('/api/usersubscriptions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
          });
          setSubscription(null);
        }
      } else {
        if (subscription) {
          setSubscribed(true);
        } else {
          const registration = await navigator.serviceWorker.ready;
          let localSub = await registration.pushManager.getSubscription();
          if (!localSub) {
            localSub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
              ),
            });
          }
          // Add device and URL info
          let deviceName = window.navigator.userAgent;
          const navAny = window.navigator as any;
          if (navAny.userAgentData) {
            const brands = navAny.userAgentData.brands
              .map((b: any) => b.brand + ' ' + b.version)
              .join(', ');
            const platform = navAny.userAgentData.platform;
            deviceName = `${platform} (${brands})`;
          }
          const originUrl = window.location.origin;
          const subscriptionPayload = {
            ...localSub.toJSON(),
            deviceName,
            originUrl,
          };
          await fetch('/api/usersubscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscriptionPayload),
          });
          setSubscription(localSub);
          setSubscribed(true);
        }
      }
    } catch (err) {
      setSubscribed(false);
    } finally {
      setNotifLoading(false);
    }
  };

  // Helper for VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  return { subscribed, subscription, notifLoading, handleSubscribe };
}
