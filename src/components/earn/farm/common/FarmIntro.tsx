import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function FarmIntro() {
  return (
    <Intro
      text={
        <>
          <span className='text-white'>Farm</span> the fields of Mars. Proceed with caution fellow
          farmer. Riches and ruins lie ahead.
        </>
      }
      bg='farm'
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
