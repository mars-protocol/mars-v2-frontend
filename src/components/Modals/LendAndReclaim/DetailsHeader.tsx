import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useAssetIncentivesApy from 'hooks/incentives/useAssetIncentiveApy'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { BNCoin } from 'types/classes/BNCoin'

interface Props {
  data: LendingMarketTableData
}

function DetailsHeader({ data }: Props) {
  const { asset, cap, accountLentAmount } = data
  const { data: assetApy } = useAssetIncentivesApy(asset.denom)
  const balanceInWallet = useCurrentWalletBalance(asset.denom)

  return (
    <div className='flex gap-4 p-4 border-b md:gap-6 md:px-6 border-white/5 gradient-header'>
      {assetApy && (
        <>
          <TitleAndSubCell
            title={
              <div className='flex flex-row'>
                <FormattedNumber amount={assetApy.toNumber()} options={{ suffix: '%' }} />
                <FormattedNumber
                  className='ml-2 text-xs'
                  amount={assetApy.dividedBy(365).toNumber()}
                  options={{ suffix: '%/day' }}
                />
              </div>
            }
            sub={'APY'}
          />
          <div className='h-100 w-[1px] '></div>
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
          <div className='h-100 w-[1px] '></div>
        </>
      )}
      {balanceInWallet && (
        <>
          <TitleAndSubCell
            title={<DisplayCurrency coin={new BNCoin(balanceInWallet)} />}
            sub={'In Wallet'}
          />
          <div className='h-100 w-[1px] '></div>
        </>
      )}
      <TitleAndSubCell
        title={
          <DisplayCurrency
            coin={new BNCoin({ denom: asset.denom, amount: cap?.max.toString() ?? '0' })}
          />
        }
        sub={'Deposit Cap'}
      />
    </div>
  )
}

export default DetailsHeader
