import { MsgExecuteContract } from '@marsprotocol/wallet-connector'
import { useQuery } from '@tanstack/react-query'
import { isMobile } from 'react-device-detect'
import { useWalletStore } from 'stores/useWalletStore'
import { queryKeys } from 'types/query-keys-factory'

export const useBroadcast = (props: UseBroadcast) => {
  const client = useWalletStore((s) => s.client)
  const userWalletAddress = useWalletStore((s) => s.client?.recentWallet.account?.address)
  const sender = props.sender ?? userWalletAddress

  return useQuery(
    [queryKeys.broadcastMessages(), props.msg],
    async () => {
      if (!client || !props.contract || !props.msg || !props.fee || !sender) return

      try {
        const broadcastOptions = {
          messages: [
            new MsgExecuteContract({
              sender: sender,
              contract: props.contract,
              msg: props.msg,
              funds: props.funds,
            }),
          ],
          feeAmount: props.fee.amount[0].amount,
          gasLimit: props.fee.gas,
          memo: undefined,
          wallet: client.recentWallet,
          mobile: isMobile,
        }

        const result = await client.broadcast(broadcastOptions)

        if (result.hash) {
          return result
        }
        throw result.rawLogs
      } catch (e) {
        throw e
      }
    },
    {
      enabled: !!sender && !!client && !!props.msg && !!props.contract && !!props.fee,
    },
  )
}
