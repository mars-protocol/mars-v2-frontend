import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useStore from 'store'
import { generateExecutionMessage } from 'store/slices/broadcast'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

export function useHandleBridgeCompletion() {
  const account = useCurrentAccount()
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const { removeSkipBridge } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
    evmAddress: undefined,
  })

  const handleBridgeCompletion = async (rowData: any) => {
    if (!rowData?.skipBridgeId) return

    try {
      const coin = BNCoin.fromDenomAndBigNumber(chainConfig.stables[0], BN(rowData.amount))
      const store = useStore.getState()
      const response = store.executeMsg({
        messages: [
          generateExecutionMessage(
            store.address,
            store.chainConfig.contracts.creditManager,
            {
              update_credit_account: {
                ...(account?.id ? { account_id: account.id } : {}),
                actions: [{ deposit: coin.toCoin() }],
              },
            },
            [coin.toCoin()],
          ),
        ],
      })

      store.handleTransaction({ response })

      const result = await response
      console.log('result', result)
      if (result.result) {
        removeSkipBridge(rowData.skipBridgeId)
      }
      if (result.error) {
        console.log('result.error', result.error)
        if (result.error?.includes('spendable balance') && result.error?.includes('is smaller')) {
          removeSkipBridge(rowData.skipBridgeId)
        }
      }
    } catch (error: any) {
      console.error('Transaction error:', error)
    }
  }

  return { handleBridgeCompletion }
}
