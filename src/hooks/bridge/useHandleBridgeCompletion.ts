import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAutoLend from 'hooks/wallet/useAutoLend'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateUsdcFeeReserve } from 'utils/feeToken'
import { BN } from 'utils/helpers'

export function useHandleBridgeCompletion() {
  const account = useCurrentAccount()
  const chainConfig = useChainConfig()
  const address = useStore((s) => s.address)
  const deposit = useStore((s) => s.deposit)
  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()

  const { removeSkipBridge } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
  })

  const handleBridgeCompletion = async (rowData: any) => {
    if (!rowData?.skipBridgeId) return

    try {
      const { depositAmount } = calculateUsdcFeeReserve(rowData.amount, chainConfig)

      if (BN(depositAmount).isZero()) {
        removeSkipBridge(rowData.skipBridgeId)
        return
      }

      const coin = BNCoin.fromDenomAndBigNumber(chainConfig.stables[0], BN(depositAmount))

      if (!account) return
      const result = await deposit({
        accountId: account?.id,
        coins: [coin],
        lend: isAutoLendEnabledForCurrentAccount,
        isAutoLend: isAutoLendEnabledForCurrentAccount,
      })
      removeSkipBridge(rowData.skipBridgeId)
    } catch (error: any) {
      console.error('Transaction error:', error)
    }
  }

  return { handleBridgeCompletion }
}
