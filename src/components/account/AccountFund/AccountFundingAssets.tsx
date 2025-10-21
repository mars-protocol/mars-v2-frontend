import { RouteResponse } from '@skip-go/client'
import classNames from 'classnames'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import Text from 'components/common/Text'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'

interface AccountFundingAssetsProps {
  fundingAssets: WrappedBNCoin[]
  combinedBalances: WrappedBNCoin[]
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string, chainName?: string) => void
  isFullPage?: boolean
  onChange?: () => void
  routeResponse?: RouteResponse
}

export default function AccountFundingAssets({
  fundingAssets,
  combinedBalances,
  isConfirming,
  updateFundingAssets,
  isFullPage,
  onChange,
  routeResponse,
}: AccountFundingAssetsProps) {
  const nativeAssets = fundingAssets.filter((asset) => !asset.chain)
  const evmAssets = fundingAssets.filter((asset) => asset.chain)

  const renderAssetGroup = (assets: WrappedBNCoin[]) => {
    return assets.map((wrappedCoin, index) => (
      <div
        key={`${wrappedCoin.coin.denom}-${index}`}
        className={classNames(
          'w-full mb-4',
          isFullPage && 'w-full p-4 border border-white/20 bg-white/5',
        )}
      >
        <AccountFundRow
          denom={wrappedCoin.coin.denom}
          balances={combinedBalances}
          amount={wrappedCoin.coin.amount}
          isConfirming={isConfirming}
          updateFundingAssets={updateFundingAssets}
          chainName={wrappedCoin.chain}
          onChange={onChange}
          routeResponse={routeResponse}
        />
      </div>
    ))
  }

  return (
    <div>
      {nativeAssets.length > 0 && (
        <>
          <Text size='sm' className='mb-2 text-white/60'>
            Native Assets
          </Text>
          {renderAssetGroup(nativeAssets)}
        </>
      )}

      {evmAssets.length > 0 && (
        <>
          {nativeAssets.length > 0 && <div className='my-4 border-t border-white/10' />}
          <Text size='sm' className='mb-2 text-white/60'>
            Bridged Asset
          </Text>
          {renderAssetGroup(evmAssets)}
        </>
      )}
    </div>
  )
}
