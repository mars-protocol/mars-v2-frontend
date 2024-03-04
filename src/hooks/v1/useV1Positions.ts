import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import useV1Debts from './useV1Debt'
import useV1Deposits from './useV1Deposits'

export default function useV1Positions(): Account | undefined {
  const address = useStore((s) => s.address)
  const { data: lends } = useV1Deposits()
  const { data: debts } = useV1Debts()

  if (!address) return

  return {
    id: address,
    debts: debts.map((debt) => new BNCoin(debt)),
    lends: lends.map((lend) => new BNCoin(lend)),
    deposits: [],
    vaults: [],
    perps: [],
    kind: 'default',
  }
}
