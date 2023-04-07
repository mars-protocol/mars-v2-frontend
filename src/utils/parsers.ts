export function isNumber(value: unknown) {
  if (typeof value === 'string' && value !== '') {
    return !isNaN(Number(value))
  }

  if (typeof value === 'number') {
    return true
  }

  return false
}

export const convertAprToApy = (apr: number, numberOfCompoundingPeriods: number): number => {
  return ((1 + apr / 100 / numberOfCompoundingPeriods) ** numberOfCompoundingPeriods - 1) * 100
}
