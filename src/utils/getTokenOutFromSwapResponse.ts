export default function getTokenOutFromSwapResponse(
  response: BroadcastResult,
  denom: string,
): Coin {
  try {
    if (response.result) {
      const rawLogs = JSON.parse(response.result.rawLogs)
      const events = rawLogs[0].events
      const tokenSwappedEvent = events.find((e: { type: string }) => e.type === 'token_swapped')
      const tokensOutValue = tokenSwappedEvent.attributes.find(
        (a: { key: string; value: string }) =>
          a.key === 'tokens_out' && a.value.toLowerCase().includes(denom.toLowerCase()),
      ).value
      const amount = tokensOutValue.split(denom)[0]

      return { denom, amount }
    }
  } catch (ex) {
    console.error(ex)
  }

  return { denom: '', amount: '' }
}
