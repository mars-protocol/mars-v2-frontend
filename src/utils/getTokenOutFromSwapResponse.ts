export default function getTokenOutFromSwapResponse(
  response: BroadcastResult,
  denom: string,
): Coin {
  if (response.result) {
    const rawLogs = JSON.parse(response.result.rawLogs)
    const events = rawLogs[0].events
    const tokenSwappedEvent = events.find((e: { type: string }) => e.type === 'token_swapped')
    const tokensOutValue = tokenSwappedEvent.attributes.find(
      (a: { key: string }) => a.key === 'tokens_out',
    ).value
    const amount = tokensOutValue.split(denom)[0]

    return { denom, amount }
  }

  return { denom: '', amount: '' }
}
