import { MsgExecuteContract } from '@marsprotocol/wallet-connector'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { GAS_ADJUSTMENT } from 'constants/gas'
import { useWalletStore } from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'

export const useEstimateFee = (props: UseEstimateFee) => {
  const client = useWalletStore((s) => s.client)
  const userWalletAddress = useWalletStore((s) => s.client?.recentWallet.account?.address)
  const sender = props.sender ?? userWalletAddress

  return useQuery(
    [queryKeys.estimateFee(), props.msg],
    async () => {
      const gasAdjustment = GAS_ADJUSTMENT

      if (!client || !props.contract || !props.msg || !sender) return

      try {
        const simulateOptions = {
          messages: [
            new MsgExecuteContract({
              sender: sender,
              contract: props.contract,
              msg: props.msg,
              funds: props.funds,
            }),
          ],
          wallet: client.recentWallet,
        }

        const result = await client.simulate(simulateOptions)

        if (result.success) {
          return {
            amount: result.fee ? result.fee.amount : [],
            gas: new BigNumber(result.fee ? result.fee.gas : 0)
              .multipliedBy(gasAdjustment)
              .toFixed(0),
          }
        }
        throw result.error
      } catch (e) {
        throw e
      }
    },
    {
      enabled: !!sender && !!client && ((!!props.msg && !!props.contract) || !!props.executeMsg),
    },
  )
}
