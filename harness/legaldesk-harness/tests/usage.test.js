import assert from 'node:assert/strict'
import test from 'node:test'
import { summarizeUsage } from '../lib/usage.js'

test('summarizes finalized Harness usage events and configured local pricing', () => {
  const events = [
    { type: 'request/header', data: { header: { config: { provider: 'deepseek', model: 'deepseek-chat' } } } },
    { type: 'assistant/chunk', data: { usage: { inputTokens: 999 } } },
    { type: 'assistant/message', data: { usage: { inputTokens: 100, cacheReadTokens: 20, outputTokens: 50, reasoningTokens: 10 } } },
    { type: 'assistant/message', data: { usage: { inputTokens: 30, cacheWriteTokens: 5, outputTokens: 15 } } },
  ]
  const result = summarizeUsage(events, { input: 2, cacheRead: 1, cacheWrite: 3, output: 8, version: 'test-2026' })
  assert.deepEqual(result, {
    provider: 'deepseek', model: 'deepseek-chat', inputTokens: 130, cacheReadTokens: 20,
    cacheWriteTokens: 5, outputTokens: 65, reasoningTokens: 10, requestCount: 2,
    estimatedCostMicrousd: 815, pricingVersion: 'test-2026',
  })
})

test('keeps cost null when deployment pricing is not configured', () => {
  const result = summarizeUsage([{ type: 'assistant/message', data: { usage: { inputTokens: 1, outputTokens: 2 } } }], undefined)
  assert.equal(result.estimatedCostMicrousd, null)
  assert.equal(result.pricingVersion, 'unpriced')
})
