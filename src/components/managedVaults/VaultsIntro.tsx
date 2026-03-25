import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'

interface Props {
  hasPerpsVault?: boolean
}

export default function VaultsIntro(props: Props) {
  return (
    <Intro
      bg='vaults'
      text={
        <>
          {props.hasPerpsVault && (
            <>
              Deposit into the <span className='text-white'>Counterparty Vault</span> to earn
              trading fees from perpetuals.{' '}
            </>
          )}
          <span className='text-white'>Community Vaults</span> are managed strategies where vault
          creators use deposited funds to run trading strategies aiming to generate returns for
          both themselves and their depositors.
        </>
      }
    >
      <Button
        text='Learn about Community Vaults'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.CREATE_VAULT_URL, '_blank')
        }}
        color='secondary'
      />
      {props.hasPerpsVault && (
        <Button
          text='Learn about Counterparty Vault'
          leftIcon={<PlusSquared />}
          onClick={(e) => {
            e.preventDefault()
            window.open(DocURL.PERPS_VAULT_URL, '_blank')
          }}
          color='secondary'
        />
      )}
    </Intro>
  )
}
