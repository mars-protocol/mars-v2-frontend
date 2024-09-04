import Button from 'components/common/Button'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'
import { PlusSquared } from 'components/common/Icons'

export default function VaultsOfficialIntro() {
  return (
    <Intro
      bg='vaults'
      text={
        <>
          <span className='text-white'>Mars official vaults</span> is an automated strategy where
          the platform uses advanced algorithms to manage borrowing and lending operations, aiming
          to maximize rewards.
        </>
      }
    >
      <Button
        text='Learn more'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          // TODO: add docs URL
          window.open(DocURL.DOCS_URL, '_blank')
        }}
        color='secondary'
      />
    </Intro>
  )
}
