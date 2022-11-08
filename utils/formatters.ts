export const formatWalletAddress = (address: string, substrLength = 6): string => {
  if (address.length <= 10) {
    return address
  }

  return `${address.slice(0, substrLength)}...${address.slice(
    address.length - substrLength,
    address.length,
  )}`
}

export const formatCurrency = (value: string | number) => {
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
