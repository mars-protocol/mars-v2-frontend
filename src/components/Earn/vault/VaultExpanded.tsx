import { Row } from '@tanstack/react-table'

import Button from 'components/Button'
import { LockUnlocked, Plus } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import useStore from 'store'

interface Props {
  row: Row<Vault | DepositedVault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export default function VaultExpanded(props: Props) {
  const vault = props.row.original as DepositedVault

  function enterVaultHandler() {
    useStore.setState({
      vaultModal: {
        vault: props.row.original,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
      },
    })
  }

  function depositMoreHandler() {
    useStore.setState({
      vaultModal: {
        vault: props.row.original,
        isDeposited: true,
        selectedBorrowDenoms: [props.row.original.denoms.secondary],
      },
    })
  }

  function unlockHandler() {
    useStore.setState({ unlockModal: { vault } })
  }

  let isDeposited: boolean = false
  if (vault?.amounts) {
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
              <Button
                onClick={depositMoreHandler}
                color='secondary'
                leftIcon={<Plus className='w-3' />}
              >
                Deposit more
              </Button>
              <Tooltip
                type='info'
                content='In order to withdraw this position, you must first unlock it. This will unlock all the funds within this position.'
              >
                <Button onClick={unlockHandler} color='tertiary' leftIcon={<LockUnlocked />}>
                  Unlock to withdraw
                </Button>
              </Tooltip>
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
