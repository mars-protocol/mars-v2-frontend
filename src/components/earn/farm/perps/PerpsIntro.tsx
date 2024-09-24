import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function PerpsIntro() {
  return (
    <Intro
      text={
        <>
          <span className='text-white'>Earn perps trading fees</span> by depositing USDC into the
          counterparty vault, with deposits subject to a 7-day lockup.
        </>
      }
      bg='perps-vault'
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
    </Intro>
  )
}
