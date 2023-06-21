import { useCallback } from 'react'

import useStore from 'store'

function useLendAndWithdrawModal() {
  const config = useStore<LendAndWithdrawModalConfig | null>((s) => s.lendAndWithdrawModal)

  const open = useCallback((action: LendAndWithdrawModalActions, data: LendingMarketTableData) => {
    const _config: LendAndWithdrawModalConfig = {
      action,
      data,
    }

    useStore.setState({ lendAndWithdrawModal: _config })
  }, [])

  const close = useCallback(() => {
    useStore.setState({ lendAndWithdrawModal: null })
  }, [])

  const openLend = useCallback((data: LendingMarketTableData) => open('lend', data), [open])
  const openWithdraw = useCallback((data: LendingMarketTableData) => open('withdraw', data), [open])

  return { config, openLend, openWithdraw, close }
}

export default useLendAndWithdrawModal
