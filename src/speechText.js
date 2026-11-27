const NUMBER_WORDS = [
  'शून्य', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ',
  'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस',
  'बीस', 'इक्कीस', 'बाईस', 'तेईस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताईस', 'अट्ठाईस', 'उनतीस',
  'तीस', 'इकतीस', 'बत्तीस', 'तैंतीस', 'चौंतीस', 'पैंतीस', 'छत्तीस', 'सैंतीस', 'अड़तीस', 'उनतालीस',
  'चालीस', 'इकतालीस', 'बयालीस', 'तैंतालीस', 'चवालीस', 'पैंतालीस', 'छियालीस', 'सैंतालीस', 'अड़तालीस', 'उनचास',
  'पचास', 'इक्यावन', 'बावन', 'तिरपन', 'चौवन', 'पचपन', 'छप्पन', 'सत्तावन', 'अट्ठावन', 'उनसठ',
  'साठ', 'इकसठ', 'बासठ', 'तिरसठ', 'चौंसठ', 'पैंसठ', 'छियासठ', 'सड़सठ', 'अड़सठ', 'उनहत्तर',
  'सत्तर', 'इकहत्तर', 'बहत्तर', 'तिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छिहत्तर', 'सतहत्तर', 'अठहत्तर', 'उन्नासी',
  'अस्सी', 'इक्यासी', 'बयासी', 'तिरासी', 'चौरासी', 'पचासी', 'छियासी', 'सत्तासी', 'अठासी', 'नवासी',
  'नब्बे', 'इक्यानवे', 'बानवे', 'तिरानवे', 'चौरानवे', 'पंचानवे', 'छियानवे', 'सत्तानवे', 'अट्ठानवे', 'निन्यानवे',
]

const INDIAN_SCALES = [
  [1e15, 'पद्म'],
  [1e13, 'नील'],
  [1e11, 'खरब'],
  [1e9, 'अरब'],
  [1e7, 'करोड़'],
  [1e5, 'लाख'],
  [1e3, 'हज़ार'],
  [1e2, 'सौ'],
]

const SPOKEN_HINDI_WORDS = [
  ['today\'s summary', 'आज का हिसाब'],
  ['entries hui', 'एंट्रियाँ हुईं'],
  ['entry hui', 'एंट्री हुई'],
  ['added to khata', 'खाते में दर्ज किया'],
  ['entry cancelled', 'एंट्री रद्द की'],
  ['ho gaya', 'हो गया'],
  ['sahi hai', 'सही है'],
  ['khata', 'खाता'],
  ['udhaar', 'उधार'],
  ['jama', 'जमा'],
  ['baaki', 'बाकी'],
  ['aaj', 'आज'],
  ['hisaab', 'हिसाब'],
  ['hisab', 'हिसाब'],
  ['ne', 'ने'],
  ['ka', 'का'],
  ['hai', 'है'],
  ['tha', 'था'],
  ['kiya', 'किया'],
  ['kiye', 'किए'],
  ['haan', 'हाँ'],
  ['nahi', 'नहीं'],
  ['ya', 'या'],
  ['theek', 'ठीक'],
  ['ab', 'अब'],
  ['balance', 'बैलेंस'],
  ['extra', 'अतिरिक्त'],
  ['apply', 'लागू'],
  ['ignore', 'अनदेखा'],
  ['update', 'अपडेट'],
  ['kar diya', 'कर दिया'],
]

export function numberToHindiWords(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Hindi number conversion requires a non-negative safe integer.')
  }

  if (value < NUMBER_WORDS.length) return NUMBER_WORDS[value]

  const [scale, scaleName] = INDIAN_SCALES.find(([unit]) => value >= unit)
  const quotient = Math.floor(value / scale)
  const remainder = value % scale
  const remainderText = remainder ? ` ${numberToHindiWords(remainder)}` : ''

  return `${numberToHindiWords(quotient)} ${scaleName}${remainderText}`
}

function amountToHindiWords(amount) {
  const value = Number(amount.replace(/,/g, ''))
  return `${numberToHindiWords(value)} रुपये`
}

export function createSpeechFriendlyText(text) {
  let spokenText = text.replace(/₹\s*([\d,]+)/g, (_, amount) => amountToHindiWords(amount))
  spokenText = spokenText.replace(/\d[\d,]*/g, (amount) => numberToHindiWords(Number(amount.replace(/,/g, ''))))

  for (const [source, replacement] of SPOKEN_HINDI_WORDS) {
    const escapedSource = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    spokenText = spokenText.replace(new RegExp(`\\b${escapedSource}\\b`, 'gi'), replacement)
  }

  return spokenText
    .replace(/[₹$€£¥]/g, ' ')
    .replace(/\s+([,.;!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
