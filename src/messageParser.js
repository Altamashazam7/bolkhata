import { getContactName, normalizeName } from './contactMatching.js'

export function formatRupees(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getTodayTransactions(transactions) {
  const today = new Date()
  return transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt)
    return date.toDateString() === today.toDateString()
  })
}

function containsPhrase(text, phrase) {
  const textTokens = text.split(' ').filter(Boolean)
  const phraseTokens = phrase.split(' ')

  return textTokens.some((_, start) =>
    phraseTokens.every((token, offset) => textTokens[start + offset] === token),
  )
}

export function parseMessage(text, ledger, transactions) {
  const normalized = text.toLocaleLowerCase()
  const normalizedCommand = normalizeName(text)
  const summaryPhrases = ['आज का हिसाब', 'aaj ka hisaab', 'aaj ka hisab', "today's summary"]
  const isDailySummary =
    summaryPhrases.some((phrase) => containsPhrase(normalizedCommand, normalizeName(phrase))) ||
    /\baaj\b.*\bhisaab\b|\bhisaab\b.*\baaj\b/i.test(normalized)

  if (isDailySummary) {
    const todayTransactions = getTodayTransactions(transactions)
    const todaySummary = {
      entries: todayTransactions,
      loanTotal: todayTransactions.reduce(
        (total, transaction) => total + (transaction.transactionType === 'loan' ? transaction.amount : 0),
        0,
      ),
      repaymentTotal: todayTransactions.reduce(
        (total, transaction) => total + (transaction.transactionType === 'repayment' ? transaction.amount : 0),
        0,
      ),
    }

    return {
      kind: 'reply',
      text: todayTransactions.length
        ? `Aaj ${todayTransactions.length} ${todayTransactions.length === 1 ? 'entry hui' : 'entries hui'}.`
        : 'Aaj abhi koi nayi entry nahi hui.',
      todaySummary,
    }
  }

  const contact = getContactName(text)
  if (!contact) {
    return {
      kind: 'reply',
      text: 'I couldn’t find that name in your khata. Try Ramesh, Sharma ji, or Geeta didi.',
    }
  }

  const isBalanceQuestion =
    /(kitna|kitne|baaki|balance|due|owe|owed|bacha|baki|कितना|कितने|बाकी)/i.test(normalized) &&
    !/\d/.test(normalized)

  if (isBalanceQuestion) {
    return {
      kind: 'reply',
      text: `${contact} ka ${formatRupees(ledger[contact])} baaki hai.`,
      balance: { contact, amount: ledger[contact] },
    }
  }

  const amountMatch = text.match(/(?:₹\s*|rs\.?\s*|inr\s*)?(\d[\d,]*)/i)
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0
  const isLending = /(liya|liye|lia|borrowed|udhaar li|karz li|took|उधार लिए)/i.test(normalized)
  const isRepayment = /(wapas|chuka|lota|paid back|repaid|returned|jama kiya|जमा किए)/i.test(normalized)
  const transactionType = isRepayment ? 'repayment' : isLending ? 'loan' : 'unknown'

  if (!amount || !Number.isSafeInteger(amount) || transactionType === 'unknown') {
    return {
      kind: 'reply',
      text: 'Tell me who and how much, like “Ramesh ne 500 udhaar liye”.',
    }
  }

  return { kind: 'confirmation', contact, amount, transactionType }
}
