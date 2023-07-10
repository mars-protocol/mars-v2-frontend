import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useAssetIncentivesApy from 'hooks/useAssetIncentiveApy'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  data: LendingMarketTableData
}

function DetailsHeader({ data }: Props) {
  const { asset, marketDepositCap, accountLentAmount } = data
  const { data: assetApy } = useAssetIncentivesApy(asset.denom)
  const balanceInWallet = useCurrentWalletBalance(asset.denom)

  return (
    <div className='flex gap-6 border-b border-white/5 px-6 py-4 gradient-header'>
      {assetApy && (
        <>
          <TitleAndSubCell
            title={
              <>
                <FormattedNumber amount={assetApy.toNumber()} options={{ suffix: '%' }} animate />
                <FormattedNumber
                  className='ml-2 text-xs'
                  amount={assetApy.dividedBy(365).toNumber()}
                  options={{ suffix: '%/day' }}
                  animate
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
            title={
              <DisplayCurrency
                coin={new BNCoin({ denom: asset.denom, amount: accountLentAmount })}
              />
            }
            sub={'Deposited'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      {balanceInWallet && (
        <>
          <TitleAndSubCell
            title={<DisplayCurrency coin={new BNCoin(balanceInWallet)} />}
            sub={'In Wallet'}
          />
          <div className='h-100 w-[1px] bg-white/10'></div>
        </>
      )}
      <TitleAndSubCell
        title={
          <DisplayCurrency
            coin={new BNCoin({ denom: asset.denom, amount: marketDepositCap.toString() })}
          />
        }
        sub={'Deposit Cap'}
      />
    </div>
  )
}

export default DetailsHeader
