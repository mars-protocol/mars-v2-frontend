import { useCallback } from 'react'

import useStore from 'store'

function useLendAndReclaimModal() {
  const config = useStore((s) => s.lendAndReclaimModal)

  const open = useCallback((action: LendAndReclaimModalAction, data: LendingMarketTableData) => {
    const _config: LendAndReclaimModalConfig = {
      action,
      data,
    }

    useStore.setState({ lendAndReclaimModal: _config })
  }, [])

  const close = useCallback(() => {
    useStore.setState({ lendAndReclaimModal: null })
  }, [])

  const openLend = useCallback((data: LendingMarketTableData) => open('lend', data), [open])
  const openReclaim = useCallback((data: LendingMarketTableData) => open('reclaim', data), [open])

  return { config, openLend, openReclaim, close }
}

export default useLendAndReclaimModal
