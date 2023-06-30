import { Row } from '@tanstack/react-table'
import moment from 'moment'

import Button from 'components/Button'
import { AccountArrowDown, LockLocked, LockUnlocked, Plus } from 'components/Icons'
import { Tooltip } from 'components/Tooltip'
import useStore from 'store'
import { VaultStatus } from 'types/enums/vault'
import { getVaultPositionStatus } from 'utils/vaults'

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

  function withdrawHandler() {
    console.log('Withdraw')
  }

  const status = getVaultPositionStatus(vault)

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
      <td colSpan={status === VaultStatus.AVAILABLE ? 5 : 6}>
        <div className='align-center flex justify-end gap-3 p-4'>
          {status === VaultStatus.AVAILABLE ? (
            <Button
              onClick={enterVaultHandler}
              color='tertiary'
              leftIcon={<Plus className='w-3' />}
            >
              Deposit
            </Button>
          ) : (
            <>
              <Button
                onClick={depositMoreHandler}
                color='secondary'
                leftIcon={<Plus className='w-3' />}
              >
                Deposit more
              </Button>

              {status === VaultStatus.DEPOSITED ? (
                <Tooltip
                  type='info'
                  content='In order to withdraw this position, you must first unlock it. This will unlock all the funds within this position.'
                >
                  <Button onClick={unlockHandler} color='tertiary' leftIcon={<LockUnlocked />}>
                    Unlock to withdraw
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  onClick={withdrawHandler}
                  color='tertiary'
                  disabled={status === VaultStatus.UNLOCKING}
                  leftIcon={status === VaultStatus.UNLOCKED ? <AccountArrowDown /> : <LockLocked />}
                >
                  {status === VaultStatus.UNLOCKED
                    ? 'Withdraw funds'
                    : `Withdraw in ${moment(vault?.unlocksAt).fromNow(true)}`}
                </Button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}
