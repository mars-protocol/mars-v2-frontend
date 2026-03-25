import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import useStore from 'store'
import { DocURL } from 'types/enums'

export default function VaultsCommunityIntro() {
  const showTutorial = useStore((s) => s.tutorial)

  return (
    <Intro
      bg='vaults'
      isCompact={!showTutorial}
      text={
        showTutorial ? (
          <>
            <span className='text-white'>User generated vaults</span> are managed strategies where
            vault creators use deposited funds to run trading strategies aiming to generate
            returns for both themselves and their depositors.
          </>
        ) : (
          <>
            <span className='text-white'>Community Vaults</span> are managed strategies where vault
            creators use deposited funds to run trading strategies.
          </>
        )
      }
    >
      {showTutorial && (
        <Button
          text='Learn more'
          leftIcon={<PlusSquared />}
          onClick={(e) => {
            e.preventDefault()
            window.open(DocURL.CREATE_VAULT_URL, '_blank')
          }}
          color='secondary'
        />
      )}
    </Intro>
  )
}
