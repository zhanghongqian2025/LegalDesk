export function createLegalDeskNotifier({ url = process.env.LEGALDESK_NOTIFY_URL, token = process.env.LEGALDESK_NOTIFY_TOKEN } = {}) {
  if (!url || !token) return async () => {}
  return async ({ status, durationMs }) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2500)
    try {
      await fetch(url, {
        method: 'POST', signal: controller.signal,
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ status, durationMs: Math.max(0, Math.round(durationMs ?? 0)) }),
      })
    } finally { clearTimeout(timeout) }
  }
}
