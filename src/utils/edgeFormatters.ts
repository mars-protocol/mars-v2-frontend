export function formatValue(
  amount: number | string,
  options?: {
    decimals?: number
    abbreviated?: boolean
    prefix?: string
    suffix?: string
    maxDecimals?: number
    minDecimals?: number
  },
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return 'N/A'

  let maxDecimals = options?.maxDecimals ?? 2
  const minDecimals = options?.minDecimals ?? 2
  if (maxDecimals < minDecimals) maxDecimals = minDecimals

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
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  })}${options?.suffix || ''}`

  return formattedAmount
}
