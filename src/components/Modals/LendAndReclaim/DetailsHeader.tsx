import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAssetIncentivesApy from 'hooks/useAssetIncentiveApy'
import useCurrentWalletBalance from 'hooks/useCurrentWalletBalance'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  data: LendingMarketTableData
}

function DetailsHeader({ data }: Props) {
  const { asset, cap, accountLentAmount } = data
  const { data: assetApy } = useAssetIncentivesApy(asset.denom)
  const balanceInWallet = useCurrentWalletBalance(asset.denom)

  return (
    <div className='flex gap-6 px-6 py-4 border-b border-white/5 gradient-header'>
      {assetApy && (
        <>
          <TitleAndSubCell
            title={
              <div className='flex flex-row'>
                <FormattedNumber amount={assetApy.toNumber()} options={{ suffix: '%' }} animate />
                <FormattedNumber
                  className='ml-2 text-xs'
                  amount={assetApy.dividedBy(365).toNumber()}
                  options={{ suffix: '%/day' }}
                  animate
                />
              </div>
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
                coin={new BNCoin({ denom: asset.denom, amount: accountLentAmount.toString() })}
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
          <DisplayCurrency coin={new BNCoin({ denom: asset.denom, amount: cap.max.toString() })} />
        }
        sub={'Deposit Cap'}
      />
    </div>
  )
}

export default DetailsHeader
