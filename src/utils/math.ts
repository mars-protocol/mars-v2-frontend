export const devideByPotentiallyZero = (numerator: number, denominator: number): number => {
  if (denominator === 0) return 0
  return numerator / denominator
}
