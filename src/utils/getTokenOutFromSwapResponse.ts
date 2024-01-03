interface Event {
  type: string
  attributes: { key: string; value: string }[]
}

export default function getTokenOutFromSwapResponse(
  response: BroadcastResult,
  denom: string,
): Coin {
  try {
    if (response.result?.response.code === 0) {
      const rawLogs = JSON.parse(response.result.rawLogs)
      const events = rawLogs[0].events as Event[]
      let tokensOutValue = '0'
      events.forEach((event: Event) => {
        const attributes = event.attributes
        const type = event.type
        if (type === 'token_swapped') {
          attributes.forEach((a) => {
            if (a.key === 'tokens_out' && a.value.toLowerCase().includes(denom.toLowerCase())) {
              tokensOutValue = a.value
            }
          })
        }
      })

      const amount = tokensOutValue.split(denom)[0]
      return { denom, amount }
    }
  } catch (ex) {
    console.error(ex)
  }

  return { denom, amount: '0' }
}
