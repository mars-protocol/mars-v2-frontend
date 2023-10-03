export default function useHealthColorAndLabel(health: number, colorPrefix: 'fill' | 'text') {
  if (health > 30) return [`${colorPrefix}-violet-500`, `${health}% (Healthy)`]
  if (health > 10) return [`${colorPrefix}-yellow-300`, `${health}% (Attention)`]

  return [`${colorPrefix}-martian-red`, `${health}% (Liquidation risk)`]
}
