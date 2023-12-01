export const getCellClasses = (cellId: string) => {
  const cellName = cellId.toLocaleLowerCase()

  if (
    cellName.includes('depositcap') ||
    cellName.includes('apy_deposit') ||
    cellName.includes('borrowrate') ||
    cellName.includes('liquidity')
  )
    return 'w-40'

  if (cellName.includes('manage')) return 'w-30'

  return false
}
