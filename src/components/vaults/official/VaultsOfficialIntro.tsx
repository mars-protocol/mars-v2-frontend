import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function VaultsOfficialIntro() {
  return (
    <Intro
      bg='vaults-official'
      text={
        <>
          <span className='text-white'>Mars official vaults</span> is an automated strategy where
          the platform uses advanced algorithms to manage borrowing and lending operations, aiming
          to maximize rewards.
        </>
      }
    >
      <Button text='Community Vault' onClick={() => {}} color='primary' />
      <Button
        text='Learn more'
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
