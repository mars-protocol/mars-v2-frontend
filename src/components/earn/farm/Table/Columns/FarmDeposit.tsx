import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import useStore from 'store'

interface Props {
  isLoading: boolean
  farm: Farm | DepositedFarm
}

export const DEPOSIT_META = { accessorKey: 'deposit', enableSorting: false, header: '' }

export const FarmDeposit = (props: Props) => {
  function enterVaultHandler() {
    const farm = props.farm as Farm

    useStore.setState({
      farmModal: {
        farm,
        selectedBorrowDenoms: [farm.denoms.secondary],
        action: 'deposit',
      },
    })
  }

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton
        onClick={enterVaultHandler}
        color='tertiary'
        text='Deposit'
        leftIcon={<Plus />}
        short
      />
    </div>
  )
}
