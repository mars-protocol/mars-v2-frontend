import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import useStore from 'store'

interface Props {
  isLoading: boolean
  astroLp: AstroLp | DepositedAstroLp
}

export const DEPOSIT_META = { accessorKey: 'deposit', enableSorting: false, header: '' }

export const AstroLpDeposit = (props: Props) => {
  function enterVaultHandler() {
    const astroLp = props.astroLp as AstroLp

    useStore.setState({
      farmModal: {
        farm: astroLp,
        selectedBorrowDenoms: [astroLp.denoms.secondary],
        action: 'deposit',
        type: 'astroLp',
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
