export function isNumber(value: unknown) {
  if (typeof value === 'string' && value !== '') {
    return !isNaN(Number(value))
  }

  if (typeof value === 'number') {
    return true
  }

  return false
}
