import { Callout, CalloutType } from 'components/common/Callout'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'

export default function OracleResyncInfo() {
  return (
    <Tooltip
      type='info'
      content={
        <Text size='xs' className='w-100'>
          The on-chain oracle prices are too old/stale.
          <br />
          To protect user funds, the interaction with Mars' smart contracts is disabled until the
          oracle is resynced.
          <br />
          The oracle will be resynced automatically, please check back later.
        </Text>
      }
      hideArrow
    >
      <Callout type={CalloutType.WARNING} className='cursor-help'>
        Oracle out of sync!
      </Callout>
    </Tooltip>
  )
}
