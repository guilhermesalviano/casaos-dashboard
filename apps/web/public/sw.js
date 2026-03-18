self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: event.data?.text() ?? 'Notificação' };
  }

  const title = data.title ?? 'Notificação';

  // Safari ignores unsupported options if passed, but some versions throw
  // Keep options minimal and safe
  const options = {
    body: data.body ?? '',
    icon: data.icon ?? '/icon.png',
    data: { url: data.url ?? '/' },
  };

  // Safari (especially iOS 16.4+) requires the promise to resolve quickly
  event.waitUntil(
    self.registration.showNotification(title, options).catch((err) => {
      console.error('[SW] showNotification failed:', err);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Reuse existing tab if already open
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
      .catch((err) => {
        console.error('[SW] notificationclick failed:', err);
      })
  );
});