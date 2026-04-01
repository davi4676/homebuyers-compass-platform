self.addEventListener('push', (event) => {
  let data = { title: 'NestQuest', body: 'You have a reminder.', url: '/' }
  try {
    if (event.data) {
      const parsed = event.data.json()
      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        url: parsed.url || data.url,
      }
    }
  } catch {
    // Keep defaults when payload parsing fails.
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
      return undefined
    })
  )
})

