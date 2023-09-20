import Button from 'components/Button'
import { PlusSquared } from 'components/Icons'
import Intro from 'components/Intro'
import { DocURL } from 'types/enums/docURL'

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
        text='Read more about Mars'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.DOCS_URL, '_blank')
        }}
        color='secondary'
      />
      <Button
        text='Learn how to Farm'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.ROVER_INTRO_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
