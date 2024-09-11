import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function HlsStakingIntro() {
  return (
    <Intro
      bg='hls-staking'
      text={
        <>
          <span className='text-white'>Leverage staking</span> is a strategy where users borrow
          funds to increase their staking position, aiming to earn more in rewards than the cost of
          the borrowed assets.
        </>
      }
    >
      <Button
        text='Learn how to Stake'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.HLS_INTRO_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
