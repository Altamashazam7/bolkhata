import { useEffect, useRef, useState } from 'react'
import './App.css'

const initialLedger = {
  Ramesh: 300,
  'Sharma ji': 1500,
  'Geeta didi': 0,
}

const contactDetails = [
  { name: 'Ramesh', initials: 'R', color: 'mint', note: 'Last active today' },
  { name: 'Sharma ji', initials: 'S', color: 'peach', note: 'Last active yesterday' },
  { name: 'Geeta didi', initials: 'G', color: 'lavender', note: 'Last active Monday' },
]

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 4 4" /></>,
    more: <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
    paperclip: <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />,
    mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v5m-4 0h8" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function Avatar({ initials, color, size = 'regular' }) {
  return <div className={`avatar avatar-${color} avatar-${size}`}>{initials}</div>
}

function formatRupees(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function getContactName(text) {
  const normalized = text.toLocaleLowerCase()
  return contactDetails.find(({ name }) => normalized.includes(name.toLocaleLowerCase()))?.name
}

function getTodayTransactions(transactions) {
  const today = new Date()
  return transactions.filter((transaction) => {
    const date = new Date(transaction.createdAt)
    return date.toDateString() === today.toDateString()
  })
}

function parseMessage(text, ledger, transactions) {
  const normalized = text.toLocaleLowerCase()

  if (/\baaj\b.*\bhisaab\b|\bhisaab\b.*\baaj\b/i.test(normalized)) {
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
    /(kitna|kitne|baaki|balance|due|owe|owed|bacha|baki)/i.test(normalized) &&
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
  const isLending = /(liya|liye|lia|borrowed|udhaar li|karz li|took)/i.test(normalized)
  const isRepayment = /(wapas|chuka|lota|paid back|repaid|returned|jama kiya)/i.test(normalized)
  const transactionType = isRepayment ? 'repayment' : isLending ? 'loan' : 'unknown'

  if (!amount || !Number.isSafeInteger(amount) || transactionType === 'unknown') {
    return {
      kind: 'reply',
      text: 'Tell me who and how much, like “Ramesh ne 500 udhaar liye”.',
    }
  }

  return { kind: 'confirmation', contact, amount, transactionType }
}

function ConfirmationCard({ message, onConfirm, onCancel }) {
  const { contact, amount, transactionType, status } = message
  const isPending = status === undefined
  const description =
    transactionType === 'repayment'
      ? `${contact} ne ${formatRupees(amount)} jama kiya`
      : `${contact} ${formatRupees(amount)} udhaar`

  return (
    <div className={`confirmation-card ${isPending ? '' : 'confirmation-complete'}`}>
      <div className="confirmation-heading">
        <span className="confirmation-icon"><Icon name="book" size={18} /></span>
        <span>{isPending ? 'New entry' : 'Khata entry'}</span>
      </div>
      <strong>{description}</strong>
      {isPending ? (
        <>
          <p>Sahi hai?</p>
          <div className="confirmation-actions">
            <button type="button" className="button-confirm" onClick={onConfirm}>Haan</button>
            <button type="button" className="button-cancel" onClick={onCancel}>Nahi</button>
          </div>
        </>
      ) : (
        <p className="confirmation-status">
          <Icon name="check" size={14} />
          {status === 'confirmed' ? 'Added to khata' : 'Entry cancelled'}
        </p>
      )}
    </div>
  )
}

function MessageBubble({ message, onConfirm, onCancel }) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`message-row ${isAssistant ? 'message-assistant' : 'message-user'}`}>
      {isAssistant && <Avatar initials="B" color="brand" size="tiny" />}
      <div className={`message-bubble ${isAssistant ? 'bubble-assistant' : 'bubble-user'}`}>
        {message.kind === 'confirmation' ? (
          <ConfirmationCard
            message={message}
            onConfirm={() => onConfirm(message.id)}
            onCancel={() => onCancel(message.id)}
          />
        ) : (
          <p>{message.text}</p>
        )}
        {message.balance && (
          <div className="balance-result">
            <span>{message.balance.contact} ka baaki</span>
            <strong>{formatRupees(message.balance.amount)}</strong>
          </div>
        )}
        {message.todaySummary && (
          <div className="today-summary">
            <div className="today-summary-title">Aaj ka hisaab</div>
            <div className="today-summary-totals">
              <div><span>Udhaar</span><strong>{formatRupees(message.todaySummary.loanTotal)}</strong></div>
              <div><span>Jama</span><strong>{formatRupees(message.todaySummary.repaymentTotal)}</strong></div>
            </div>
            {message.todaySummary.entries.length > 0 && (
              <ul>
                {message.todaySummary.entries.map((transaction) => (
                  <li key={transaction.id}>
                    <span>{transaction.contact}</span>
                    <span>{transaction.transactionType === 'loan' ? 'Udhaar' : 'Jama'}</span>
                    <strong>{formatRupees(transaction.amount)}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <span className="message-time">
          {message.time}
          {!isAssistant && <Icon name="check" size={13} />}
        </span>
      </div>
    </div>
  )
}

function Composer({ onSend, onVoice, listening, voiceAvailable }) {
  const [draft, setDraft] = useState('')

  function submitMessage(event) {
    event.preventDefault()
    if (!draft.trim()) return
    onSend(draft.trim())
    setDraft('')
  }

  return (
    <form className="composer" onSubmit={submitMessage}>
      <button className="icon-button attach-button" type="button" aria-label="Attach a file">
        <Icon name="paperclip" size={21} />
      </button>
      <input
        aria-label="Message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Message BolKhata..."
      />
      {draft.trim() ? (
        <button className="send-button" type="submit" aria-label="Send message">
          <Icon name="send" size={19} />
        </button>
      ) : (
        <button
          className={`mic-button ${listening ? 'mic-listening' : ''}`}
          type="button"
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
          title={voiceAvailable ? 'Speak your message' : 'Voice input is not supported in this browser'}
          onClick={onVoice}
        >
          <Icon name="mic" size={20} />
        </button>
      )}
    </form>
  )
}

function App() {
  const [ledger, setLedger] = useState(initialLedger)
  const [transactions, setTransactions] = useState([])
  const [activeContact, setActiveContact] = useState('Ramesh')
  const [listening, setListening] = useState(false)
  const [notice, setNotice] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Namaste! I’m your personal khata. Tell me about a udhaar or ask what someone owes.',
      time: '9:41 AM',
    },
    {
      id: 2,
      role: 'assistant',
      text: 'Try “Ramesh ne 500 udhaar liye” or “Ramesh ka kitna baaki hai?”',
      time: '9:41 AM',
    },
  ])
  const messagesEndRef = useRef(null)
  const nextId = useRef(3)
  const resolvedTransactions = useRef(new Set())

  const SpeechRecognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  function addAssistantMessage(message) {
    setMessages((current) => [...current, {
      id: nextId.current++,
      role: 'assistant',
      time: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }),
      ...message,
    }])
  }

  function sendMessage(text) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
    const parsed = parseMessage(text, ledger, transactions)
    if (parsed.contact) setActiveContact(parsed.contact)
    setMessages((current) => [
      ...current,
      { id: nextId.current++, role: 'user', text, time },
      {
        id: nextId.current++,
        role: 'assistant',
        time,
        ...parsed,
        kind: parsed.kind,
      },
    ])
  }

  function confirmEntry(id) {
    const transaction = messages.find((message) => message.id === id)
    if (!transaction || transaction.status !== undefined || resolvedTransactions.current.has(id)) return
    resolvedTransactions.current.add(id)

    setLedger((current) => ({
      ...current,
      [transaction.contact]:
        current[transaction.contact] +
        (transaction.transactionType === 'repayment' ? -transaction.amount : transaction.amount),
    }))
    setTransactions((current) => [...current, {
      id: transaction.id,
      contact: transaction.contact,
      amount: transaction.amount,
      transactionType: transaction.transactionType,
      createdAt: Date.now(),
    }])
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, status: 'confirmed' } : message,
    ))
    addAssistantMessage({
      text: `Ho gaya! ${transaction.contact} ka khata update kar diya.`,
      kind: 'reply',
    })
  }

  function cancelEntry(id) {
    if (resolvedTransactions.current.has(id)) return
    resolvedTransactions.current.add(id)
    setMessages((current) => current.map((message) =>
      message.id === id ? { ...message, status: 'cancelled' } : message,
    ))
    addAssistantMessage({ text: 'Theek hai, entry nahi ki.', kind: 'reply' })
  }

  function startVoiceInput() {
    if (!SpeechRecognition) {
      setNotice('Voice input isn’t available in this browser. You can type your message instead.')
      window.setTimeout(() => setNotice(''), 4000)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'hi-IN'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      sendMessage(transcript)
      setListening(false)
    }
    recognition.onerror = () => {
      setListening(false)
      setNotice('Could not hear that. Please try again or type your message.')
      window.setTimeout(() => setNotice(''), 4000)
    }
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="brand-header">
          <div className="brand-mark"><Icon name="book" size={21} /></div>
          <span>bol<span>khata</span></span>
          <button className="icon-button sidebar-search" type="button" aria-label="Search chats">
            <Icon name="search" size={19} />
          </button>
        </header>

        <section className="ledger-overview">
          <div className="overview-copy">
            <span className="eyebrow">TOTAL TO COLLECT</span>
            <strong>{formatRupees(Object.values(ledger).reduce((sum, amount) => sum + amount, 0))}</strong>
            <span className="overview-caption"><span className="status-dot" /> Across 3 people</span>
          </div>
          <div className="overview-icon"><Icon name="book" size={21} /></div>
        </section>

        <div className="contact-heading">
          <span>YOUR CHATS</span>
          <button type="button" className="add-contact" aria-label="Add contact"><Icon name="plus" size={17} /></button>
        </div>
        <nav className="contact-list" aria-label="Chats">
          {contactDetails.map(({ name, initials, color, note }) => (
            <button
              type="button"
              className={`contact-item ${activeContact === name ? 'contact-active' : ''}`}
              key={name}
              onClick={() => setActiveContact(name)}
            >
              <Avatar initials={initials} color={color} />
              <span className="contact-copy">
                <span className="contact-name">{name}</span>
                <span className="contact-note">{note}</span>
              </span>
              <span className="contact-amount">{formatRupees(ledger[name])}</span>
            </button>
          ))}
        </nav>

        <footer className="sidebar-footer">
          <Avatar initials="A" color="brand" />
          <span><strong>Your khata</strong><small>Private & secure</small></span>
          <button className="icon-button" type="button" aria-label="More options"><Icon name="more" size={19} /></button>
        </footer>
      </aside>

      <section className="chat-panel" aria-label="BolKhata conversation">
        <header className="chat-header">
          <div className="mobile-brand"><div className="brand-mark"><Icon name="book" size={18} /></div>bol<span>khata</span></div>
          <Avatar
            initials={contactDetails.find((contact) => contact.name === activeContact).initials}
            color={contactDetails.find((contact) => contact.name === activeContact).color}
          />
          <div className="chat-contact">
            <strong>{activeContact}</strong>
            <span><span className="status-dot" /> Your khata conversation</span>
          </div>
          <button className="icon-button chat-search" type="button" aria-label="Search conversation"><Icon name="search" size={20} /></button>
          <button className="icon-button mobile-menu" type="button" aria-label="More options"><Icon name="more" size={20} /></button>
          <div className="chat-date">TODAY</div>
        </header>

        <div className="chat-wallpaper">
          <div className="date-divider"><span>Today</span></div>
          <div className="messages">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onConfirm={confirmEntry}
                onCancel={cancelEntry}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chat-tip"><span>🔒</span> Your messages and ledger stay on this device.</div>
        </div>

        {notice && <div className="notice" role="status">{notice}</div>}
        <Composer
          onSend={sendMessage}
          onVoice={startVoiceInput}
          listening={listening}
          voiceAvailable={Boolean(SpeechRecognition)}
        />
        <div className="bottom-caption">A little clarity for every udhaar.</div>
      </section>
    </main>
  )
}

export default App
