import Divider from 'components/common/Divider'
import SwitchWithLabel from 'components/common/Switch/SwitchWithLabel'
import { Callout, CalloutType } from 'components/common/Callout'

type ReduceOnlySwitchProps = {
  isReduceOnly: boolean
  setIsReduceOnly: (value: boolean) => void
  isStopOrder: boolean
  reduceOnlyWarning: string | null
}

export const ReduceOnlySwitch = ({
  isReduceOnly,
  setIsReduceOnly,
  isStopOrder,
  reduceOnlyWarning,
}: ReduceOnlySwitchProps) => {
  return (
    <>
      <Divider />
      <SwitchWithLabel
        name='reduce-only'
        label='Reduce Only'
        value={isReduceOnly}
        onChange={() => setIsReduceOnly(!isReduceOnly)}
        tooltip={
          isStopOrder
            ? 'Use "Reduce Only" for stop orders to ensure the order only reduces or closes your position.'
            : 'Use "Reduce Only" for limit orders to decrease your position. It prevents new position creation if the existing one is modified or closed.'
        }
      />
      {reduceOnlyWarning && <Callout type={CalloutType.WARNING}>{reduceOnlyWarning}</Callout>}
    </>
  )
}
