import { BroadcastResult } from '@delphi-labs/shuttle-react'

export function getSingleValueFromBroadcastResult(
  response: BroadcastResult,
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
