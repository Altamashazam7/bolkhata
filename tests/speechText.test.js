import assert from 'node:assert/strict'
import test from 'node:test'
import { createSpeechFriendlyText, numberToHindiWords } from '../src/speechText.js'

test('converts amount numbers to Hindi words', () => {
  assert.equal(numberToHindiWords(300), 'तीन सौ')
  assert.equal(numberToHindiWords(800), 'आठ सौ')
  assert.equal(numberToHindiWords(1200), 'एक हज़ार दो सौ')
})

test('speaks balances in Hindi without changing their UI text', () => {
  const uiText = 'Ramesh ka ₹800 baaki hai'

  assert.equal(createSpeechFriendlyText(uiText), 'Ramesh का आठ सौ रुपये बाकी है')
  assert.equal(uiText, 'Ramesh ka ₹800 baaki hai')
})

test('speaks jama entries in Hindi and removes the currency symbol', () => {
  assert.equal(
    createSpeechFriendlyText('Sharma ji ne ₹1200 jama kiya'),
    'Sharma ji ने एक हज़ार दो सौ रुपये जमा किया',
  )
})

test('converts amounts and Hindi bookkeeping words in speech', () => {
  assert.equal(
    createSpeechFriendlyText('Ramesh ₹1,700 extra udhaar. Khata ka balance ₹0 hai.'),
    'Ramesh एक हज़ार सात सौ रुपये अतिरिक्त उधार. खाता का बैलेंस शून्य रुपये है.',
  )
})
