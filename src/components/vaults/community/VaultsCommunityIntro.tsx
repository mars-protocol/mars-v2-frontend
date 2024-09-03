import Button from 'components/common/Button'
import { Plus, PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

export default function VaultsCommunityIntro() {
  return (
    <Intro
      bg='vaults-community'
      text={
        <>
          <span className='text-white'>User generated vaults </span> is a strategy where users
          borrow funds to increase their yield farming position, aiming to earn more in rewards than
          the cost of the borrowed assets.
        </>
      }
    >
      <Button text='Create Vault' leftIcon={<Plus />} onClick={() => {}} color='primary' />
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
