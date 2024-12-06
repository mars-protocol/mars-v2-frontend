import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  isLoading: boolean
  astroLp: AstroLp | DepositedAstroLp
}

export const DEPOSIT_META = {
  accessorKey: 'deposit',
  enableSorting: false,
  header: '',
  meta: { className: 'w-30' },
}

export const AstroLpDeposit = (props: Props) => {
  const assets = useWhitelistedAssets()
  function enterVaultHandler() {
    const astroLp = props.astroLp as AstroLp
    const primaryAsset = assets.find(byDenom(astroLp.denoms.primary))
    const secondaryAsset = assets.find(byDenom(astroLp.denoms.secondary))

    const borrowableAssets =
      !primaryAsset || !secondaryAsset
        ? []
        : [primaryAsset, secondaryAsset].filter((asset) => asset.isBorrowEnabled)

    useStore.setState({
      farmModal: {
        farm: astroLp,
        selectedBorrowDenoms: borrowableAssets.length ? [borrowableAssets[0].denom] : [],
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
