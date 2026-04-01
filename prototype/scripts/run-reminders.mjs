const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL
const cronSecret = process.env.CRON_SECRET

if (!appUrl) {
  console.error('Missing APP_URL or NEXT_PUBLIC_APP_URL')
  process.exit(1)
}

if (!cronSecret) {
  console.error('Missing CRON_SECRET')
  process.exit(1)
}

async function run() {
  const endpoint = `${appUrl.replace(/\/$/, '')}/api/user/reminders/run`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cronSecret}`,
    },
  })

  const text = await res.text()
  if (!res.ok) {
    console.error(`Reminder worker failed (${res.status}): ${text}`)
    process.exit(1)
  }

  console.log(`Reminder worker success: ${text}`)
}

run().catch((error) => {
  console.error('Reminder worker crashed:', error)
  process.exit(1)
})

