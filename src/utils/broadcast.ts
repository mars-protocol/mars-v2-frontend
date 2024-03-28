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
  if (error === 'Transaction failed: Request rejected') return 'Transaction rejected by user'
  return `Transaction failed: ${error}`
}

export function getTransactionTarget(result: BroadcastResult): string {
  // TODO: get target based on contract
  // E.g.: if the contract is the Red Bank, return 'Red Bank'
  // if the contract is the Credit Manager, return `Credit Account ${id}`

  return ''
}

export function identifyTransactionType(result: BroadcastResult): string {
  // TODO identify the transaction type based on the events of the transaction

  return ''
}

export default function getTokenOutFromSwapResponse(
  response: BroadcastResult,
  denom: string,
): Coin {
  try {
    if (response.result?.response.code === 0) {
      const rawLogs = JSON.parse(response.result.rawLogs)
      const events = rawLogs.map((log: any) => log.events).flat() as Event[]
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
