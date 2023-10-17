export function getHealthIndicatorColors(
  color: string,
  updatedColor: string,
  colorPrefix: 'fill' | 'text',
  isUpdated: boolean,
  isIncrease: boolean,
): [backgroundColor: string, foregroundColor: string] {
  let backgroundColor = color
  if (isUpdated && isIncrease) backgroundColor = updatedColor
  if (isUpdated && !isIncrease) backgroundColor = `${colorPrefix}-grey-light`

  const foreGroundColor = updatedColor

  return [backgroundColor, foreGroundColor]
}
