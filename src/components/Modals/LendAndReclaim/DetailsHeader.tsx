import DisplayCurrency from 'components/DisplayCurrency'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { FormattedNumber } from 'components/FormattedNumber'
import useAssetIncentivesApy from 'hooks/useAssetIncentiveApy'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'

interface Props {
  data: LendingMarketTableData
}

function DetailsHeader({ data }: Props) {
  const { asset, marketDepositCap, accountLentAmount } = data
  const { data: assetApy } = useAssetIncentivesApy(asset.denom)
  const balanceInWallet = useCurrentWalletBalance(asset.denom)

  return (
    <div className='flex gap-6 border-b border-b-white/5 px-6 py-4 gradient-header'>
      {assetApy && (
        <>
          <TitleAndSubCell
            title={
              <>
                <FormattedNumber amount={assetApy} options={{ suffix: '%' }} />
                <FormattedNumber
                  className='ml-2 text-xs'
                  amount={assetApy.div(365)}
                  options={{ suffix: '%/day' }}
                />
              </>
            }
            sub={'APY'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      {accountLentAmount && (
        <>
          <TitleAndSubCell
            title={<DisplayCurrency coin={{ denom: asset.denom, amount: accountLentAmount }} />}
            sub={'Deposited'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      {balanceInWallet && (
        <>
          <TitleAndSubCell title={<DisplayCurrency coin={balanceInWallet} />} sub={'In Wallet'} />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      <TitleAndSubCell
        title={
          <DisplayCurrency coin={{ denom: asset.denom, amount: marketDepositCap.toString() }} />
        }
        sub={'Deposit Cap'}
      />
    </div>
  )
}

export default DetailsHeader
