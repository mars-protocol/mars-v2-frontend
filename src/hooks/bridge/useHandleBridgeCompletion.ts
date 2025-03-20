import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useStore from 'store'
import { generateExecutionMessage } from 'store/slices/broadcast'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { calculateUsdcFeeReserve } from 'utils/feeToken'

export function useHandleBridgeCompletion() {
  const account = useCurrentAccount()
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)

  const { removeSkipBridge } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
  })

  const handleBridgeCompletion = async (rowData: any) => {
    if (!rowData?.skipBridgeId) return

    try {
      const { depositAmount } = calculateUsdcFeeReserve(rowData.amount)

      if (BN(depositAmount).isZero()) {
        removeSkipBridge(rowData.skipBridgeId)
        return
      }

      const coin = BNCoin.fromDenomAndBigNumber(chainConfig.stables[0], BN(depositAmount))

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
      if (result.result) {
        removeSkipBridge(rowData.skipBridgeId)
      }
      if (result.error) {
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
