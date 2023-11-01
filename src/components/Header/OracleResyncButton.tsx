import { useCallback } from 'react'

import Button from 'components/Button'
import { ExclamationMarkCircled } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import usePricesData from 'hooks/usePriceData'
import useStore from 'store'

export default function OracleResyncButton() {
  const { data: pricesData } = usePricesData()
  const updateOracle = useStore((s) => s.updateOracle)

  const updatePythOracle = useCallback(() => updateOracle(pricesData), [pricesData])

  return (
    <Tooltip
      type='warning'
      content='The on-chain Pyth Oracle prices are stale. Update them by executing a resync transaction.'
      hideArrow={true}
    >
      <Button
        leftIcon={<ExclamationMarkCircled className='w-4' />}
        text='Resync Oracle'
        className='!text-warning !border-warning hover:bg-warning/20 active:bg-warning/20 focus:bg-warning/20 animate-pulse'
        color='secondary'
        onClick={updatePythOracle}
      />
    </Tooltip>
  )
}
