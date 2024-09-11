import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function HlsFarmIntro() {
  return (
    <Intro
      bg='hls-farm'
      text={
        <>
          <span className='text-white'>Leveraged farming</span> is a strategy where users borrow
          funds to increase their yield farming position, aiming to earn more in rewards than the
          cost of the borrowed assets.
        </>
      }
    >
      <Button
        text='Learn how to Farm'
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
