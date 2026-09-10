export function summarizeUsage(events, pricing = pricingFromEnv()) {
  let provider = ''
  let model = ''
  let inputTokens = 0
  let cacheReadTokens = 0
  let cacheWriteTokens = 0
  let outputTokens = 0
  let reasoningTokens = 0
  let requestCount = 0
  for (const event of events ?? []) {
    if (event?.type === 'request/header') {
      provider = string(event.data?.header?.config?.provider) || provider
      model = string(event.data?.header?.config?.model) || model
    }
    if (event?.type !== 'assistant/message' || event.data?.usage === undefined) continue
    const usage = event.data.usage
    inputTokens += count(usage.inputTokens)
    cacheReadTokens += count(usage.cacheReadTokens)
    cacheWriteTokens += count(usage.cacheWriteTokens)
    outputTokens += count(usage.outputTokens)
    reasoningTokens += count(usage.reasoningTokens)
    requestCount += 1
  }
  const priced = pricing !== undefined
  const estimatedCostMicrousd = priced ? Math.round(
    inputTokens * pricing.input + cacheReadTokens * pricing.cacheRead
    + cacheWriteTokens * pricing.cacheWrite + outputTokens * pricing.output,
  ) : null
  return {
    provider, model, inputTokens, cacheReadTokens, cacheWriteTokens, outputTokens,
    reasoningTokens, requestCount, estimatedCostMicrousd,
    pricingVersion: priced ? pricing.version : 'unpriced',
  }
}

export function pricingFromEnv(env = process.env) {
  const values = ['INPUT', 'CACHE_READ', 'CACHE_WRITE', 'OUTPUT'].map(key => env[`LEGALDESK_PRICE_${key}_USD_PER_MILLION`])
  if (values.every(value => value === undefined || value === '')) return undefined
  if (values.some(value => !Number.isFinite(Number(value)) || Number(value) < 0)) return undefined
  return {
    input: Number(values[0]), cacheRead: Number(values[1]), cacheWrite: Number(values[2]), output: Number(values[3]),
    version: string(env.LEGALDESK_PRICE_VERSION) || 'deployment-config',
  }
}

function count(value) { return Number.isSafeInteger(value) && value >= 0 ? value : 0 }
function string(value) { return typeof value === 'string' ? value : '' }
