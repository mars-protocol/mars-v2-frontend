export default function useHealthColorAndLabel(health: number, colorPrefix: 'fill' | 'text') {
  if (health > 30) return [`${colorPrefix}-violet-500`, 'Healthy']
  if (health > 10) return [`${colorPrefix}-yellow-300`, 'Attention']

  return [`${colorPrefix}-martian-red`, 'Liquidation risk']
}
