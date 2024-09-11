export default function useHealthColor(health: number, colorPrefix: 'fill' | 'text') {
  if (health > 30) return `${colorPrefix}-violet-500`
  if (health > 10) return `${colorPrefix}-yellow-300`

  return `${colorPrefix}-martian-red`
}
