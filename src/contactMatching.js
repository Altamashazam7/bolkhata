export const contactDetails = [
  { name: 'Ramesh', aliases: ['रमेश'], initials: 'R', color: 'mint', note: 'Last active today' },
  { name: 'Sharma ji', aliases: ['शर्मा जी'], initials: 'S', color: 'peach', note: 'Last active yesterday' },
  { name: 'Geeta didi', aliases: ['गीता दीदी'], initials: 'G', color: 'lavender', note: 'Last active Monday' },
]

export function normalizeName(value) {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function containsName(textTokens, name) {
  const nameTokens = normalizeName(name).split(' ')
  return textTokens.some((_, start) =>
    nameTokens.every((token, offset) => textTokens[start + offset] === token),
  )
}

export function getContactName(text) {
  const textTokens = normalizeName(text).split(' ').filter(Boolean)

  return contactDetails.find(({ name, aliases }) =>
    [name, ...aliases].some((alias) => containsName(textTokens, alias)),
  )?.name
}
