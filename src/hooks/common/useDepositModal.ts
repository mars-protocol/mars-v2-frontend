import { useCallback } from 'react'

import useStore from 'store'

function useDepositModal() {
  const config = useStore((s) => s.depositModal)

  const open = useCallback((action: DepositModalAction, data: LendingMarketTableData) => {
    const _config: DepositModalConfig = {
      action,
      data,
    }

    useStore.setState({ depositModal: _config })
  }, [])

  const close = useCallback(() => {
    useStore.setState({ depositModal: null })
  }, [])

  const openDeposit = useCallback((data: LendingMarketTableData) => open('deposit', data), [open])
  const openDepositAndLend = useCallback(
    (data: LendingMarketTableData) => open('deposit-and-lend', data),
    [open],
  )

  return { config, openDeposit, openDepositAndLend, close }
}

export default useDepositModal
