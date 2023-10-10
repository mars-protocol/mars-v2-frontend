export function getSingleValueFromBroadcastResult(
  response: BroadcastResult['result'],
  messageType: string,
  messageKey: string,
): string | null {
  const value = response?.response.events
    .filter((msg: Record<string, string>) => msg.type === messageType)
    .map((msg: Record<string, string>) => msg.attributes)
    .flat()
    .find((msg: Record<string, string>) => msg.key === messageKey)?.value

  if (!value) return null
  return value
}

export function generateErrorMessage(result: BroadcastResult, errorMessage?: string) {
  const error = result.error ? result.error : result.result?.rawLogs
  if (errorMessage) return errorMessage
  if (error === 'Transaction failed') return 'Transaction rejected by user'
  return `Transaction failed: ${error}`
}
