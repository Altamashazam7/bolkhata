import assert from 'node:assert/strict'
import test from 'node:test'
import { parseMessage } from '../src/messageParser.js'

const ledger = { Ramesh: 300, 'Sharma ji': 1500, 'Geeta didi': 0 }

test('parses Hindi loan phrase like its Roman spelling', () => {
  const expected = {
    kind: 'confirmation',
    contact: 'Ramesh',
    amount: 500,
    transactionType: 'loan',
  }

  assert.deepEqual(parseMessage('रमेश ने 500 उधार लिए', ledger, []), expected)
  assert.deepEqual(parseMessage('Ramesh ne 500 udhaar liye', ledger, []), expected)
})

test('parses Hindi repayment phrase like its Roman spelling', () => {
  const expected = {
    kind: 'confirmation',
    contact: 'Sharma ji',
    amount: 1200,
    transactionType: 'repayment',
  }

  assert.deepEqual(parseMessage('शर्मा जी ने 1200 जमा किए', ledger, []), expected)
  assert.deepEqual(parseMessage('Sharma ji ne 1200 jama kiya', ledger, []), expected)
})

test('parses Hindi balance question like its Roman spelling', () => {
  const expected = {
    kind: 'reply',
    text: 'Ramesh ka ₹300 baaki hai.',
    balance: { contact: 'Ramesh', amount: 300 },
  }

  assert.deepEqual(parseMessage('रमेश का कितना बाकी है', ledger, []), expected)
  assert.deepEqual(parseMessage('Ramesh ka kitna baaki hai', ledger, []), expected)
})

test('daily summary commands always return the summary card data', () => {
  const commands = [
    'आज का हिसाब',
    'Aaj ka hisaab',
    'aaj ka hisab',
    "today's summary",
  ]

  for (const command of commands) {
    const result = parseMessage(command, ledger, [])
    assert.equal(result.kind, 'reply', command)
    assert.deepEqual(result.todaySummary, {
      entries: [],
      loanTotal: 0,
      repaymentTotal: 0,
    }, command)
  }
})
