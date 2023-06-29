import { Row } from '@tanstack/react-table'
import Button from 'components/Button'

import { LockUnlocked, Plus } from 'components/Icons'
import useStore from 'store'

interface Props {
  row: Row<Vault | DepositedVault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  function enterVaultHandler() {
    useStore.setState({
      vaultModal: {
        vault: props.row.original,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
      },
    })
  }

  let isDeposited: boolean = false
  if ((props.row.original as DepositedVault)?.amounts) {
    isDeposited = true
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
      <td colSpan={isDeposited ? 6 : 5}>
        <div className='align-center flex justify-end gap-3 p-4'>
          {isDeposited ? (
            <>
              <Button color='secondary' leftIcon={<Plus className='w-3' />}>
                Deposit more
              </Button>
              <Button color='tertiary' leftIcon={<LockUnlocked />}>
                Unlock to withdraw
              </Button>
            </>
          ) : (
            <Button
              onClick={enterVaultHandler}
              color='tertiary'
              leftIcon={<Plus className='w-3' />}
            >
              Deposit
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
