import { Row } from '@tanstack/react-table'

import useStore from 'store'
import VaultCard from 'components/earn/vault/VaultCard'
import Text from 'components/Text'

interface Props {
  row: Row<Vault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  function enterVaultHandler() {
    useStore.setState({ vaultModal: { vault: props.row.original } })
  }

  return (
    <tr
      key={props.row.id}
      className='cursor-pointer bg-black/20 transition-colors'
      onClick={(e) => {
        e.preventDefault()
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      <td colSpan={5}>
        <Text className='border-b border-white/10 px-4 py-5 '>Select bonding period</Text>
        <div className='grid grid-cols-3 md:[&>div:nth-child(3)]:border-none'>
          <VaultCard
            vault={props.row.original}
            title='1 day unbonding'
            subtitle='$0 deposited'
            unbondingPeriod={1}
          />
          <VaultCard
            vault={props.row.original}
            title='7 day unbonding'
            subtitle='$0 deposited'
            unbondingPeriod={7}
          />
          <VaultCard
            vault={props.row.original}
            title='14 day unbonding'
            subtitle='$0 deposited'
            unbondingPeriod={14}
          />
        </div>
      </td>
    </tr>
  )
}
