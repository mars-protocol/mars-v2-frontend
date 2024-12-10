import { useCallback } from 'react'

import Button from 'components/common/Button'
import { ExclamationMarkCircled } from 'components/common/Icons'
import { Tooltip } from 'components/common/Tooltip'
import useStore from 'store'

export default function OracleResyncButton() {
  const resyncOracle = useStore((s) => s.resyncOracle)
  const updatePythOracle = useCallback(() => resyncOracle(), [resyncOracle])

  return (
    <Tooltip
      type='warning'
      content='The on-chain oracle prices are too old/stale. Update you can try to update them, by resyncing the oracle.'
      hideArrow
    >
      <Button
        leftIcon={<ExclamationMarkCircled className='w-4' />}
        text='Resync Oracle'
        className='!text-warning !border-warning hover:bg-warning/20 active:bg-warning/20 focus:bg-warning/20'
        color='secondary'
        onClick={updatePythOracle}
      />
    </Tooltip>
  )
}
