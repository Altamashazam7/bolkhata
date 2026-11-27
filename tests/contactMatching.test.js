import assert from 'node:assert/strict'
import test from 'node:test'
import { getContactName } from '../src/contactMatching.js'

test('matches canonical English names regardless of case', () => {
  assert.equal(getContactName('Ramesh'), 'Ramesh')
  assert.equal(getContactName('ramesh'), 'Ramesh')
  assert.equal(getContactName('Sharma ji'), 'Sharma ji')
  assert.equal(getContactName('Geeta didi'), 'Geeta didi')
})

test('matches Hindi-script names to canonical ledger names', () => {
  assert.equal(getContactName('रमेश'), 'Ramesh')
  assert.equal(getContactName('शर्मा जी'), 'Sharma ji')
  assert.equal(getContactName('गीता दीदी'), 'Geeta didi')
})

test('matches normalized names within Hindi transaction phrases', () => {
  assert.equal(getContactName('रमेश ने 500 उधार लिए'), 'Ramesh')
  assert.equal(getContactName('शर्मा   जी ने 1200 जमा किया'), 'Sharma ji')
  assert.equal(getContactName('गीता दीदी का कितना बाकी है?'), 'Geeta didi')
})

test('does not match partial Roman names', () => {
  assert.equal(getContactName('Rameshwar'), undefined)
})
