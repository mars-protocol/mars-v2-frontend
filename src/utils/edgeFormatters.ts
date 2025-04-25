export function formatValue(
  amount: number | string,
  options?: { decimals?: number; abbreviated?: boolean; prefix?: string },
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'N/A'

  const convertedAmount = num / 10 ** (options?.decimals ?? 0)

  if (options?.abbreviated) {
    if (convertedAmount >= 1_000_000_000) {
      return `${options.prefix || ''}${(convertedAmount / 1_000_000_000).toFixed(2)}B`
    }
    if (convertedAmount >= 1_000_000) {
      return `${options.prefix || ''}${(convertedAmount / 1_000_000).toFixed(2)}M`
    }
    if (convertedAmount >= 1_000) {
      return `${options.prefix || ''}${(convertedAmount / 1_000).toFixed(2)}K`
    }
  }

  const formattedAmount = `${options?.prefix || ''}${convertedAmount.toLocaleString('en', {
    useGrouping: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  return formattedAmount
}
