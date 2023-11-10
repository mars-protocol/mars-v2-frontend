import Button from 'components/Button'
import { PlusSquared } from 'components/Icons'
import Intro from 'components/Intro'
import { DocURL } from 'types/enums/docURL'

export default function HLSStakingIntro() {
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
          window.open(DocURL.FARM_INTRO_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
