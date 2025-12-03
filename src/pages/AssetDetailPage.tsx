import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import useAssets from 'hooks/assets/useAssets'
import { bySymbol } from 'utils/array'
import Text from 'components/common/Text'
import AssetImage from 'components/common/assets/AssetImage'
import { FormattedNumber } from 'components/common/FormattedNumber'
import DisplayCurrency from 'components/common/DisplayCurrency'
import AssetMarketInfo from 'components/common/AssetMarketInfo'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useCurrentWalletBalance from 'hooks/wallet/useCurrentWalletBalance'
import { accumulateAmounts } from 'utils/accounts'
import { BNCoin } from 'types/classes/BNCoin'
import { demagnify, getSpotPriceDecimals } from 'utils/formatters'
import { BN_ONE, BN_ZERO } from 'constants/math'
import { BN, mergeBNCoinArrays } from 'utils/helpers'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine } from 'components/common/Icons'
import useStore from 'store'

export default function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const { data: assets } = useAssets()
  const asset = symbol ? assets?.find(bySymbol(symbol)) : undefined
  const account = useCurrentAccount()
  const walletBalance = useCurrentWalletBalance(asset?.denom || '')

  const accountBalance = useMemo(() => {
    if (!asset || !account) return BN_ZERO
    return accumulateAmounts(asset.denom, [...account.deposits, ...account.lends])
  }, [asset, account])

  const accountBalanceCoin = useMemo(() => {
    if (!asset) return null
    return BNCoin.fromDenomAndBigNumber(asset.denom, accountBalance)
  }, [asset, accountBalance])

  const walletBalanceCoin = useMemo(() => {
    if (!asset || !walletBalance) return null
    return BNCoin.fromDenomAndBigNumber(asset.denom, BN(walletBalance.amount))
  }, [asset, walletBalance])

  if (!asset) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Text size='lg'>Asset not found</Text>
      </div>
    )
  }

  return (
    <div className='flex flex-col w-full gap-6 py-8'>
      <div className='flex items-center justify-between w-full'>
        <div className='flex items-center gap-4'>
          <AssetImage asset={asset} className='w-12 h-12' />
          <div className='flex flex-col'>
            <Text size='3xl'>{asset.name}</Text>
            <div className='flex items-center gap-2'>
              <Text size='sm' className='text-gray-400'>
                {asset.symbol}
              </Text>
              {asset.price && (
                <>
                  <Text size='sm' className='text-gray-400'>
                    •
                  </Text>
                  <DisplayCurrency
                    coin={
                      new BNCoin({
                        denom: asset.denom,
                        amount: BN_ONE.shiftedBy(asset.decimals).toString(),
                      })
                    }
                    className='text-sm text-gray-400'
                    options={{
                      maxDecimals: getSpotPriceDecimals(asset.price.amount),
                    }}
                    showDetailedPrice
                  />
                </>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-8'>
          {accountBalanceCoin && (
            <div className='flex flex-col'>
              <Text size='sm' className='text-gray-400 mb-1'>
                Account Balance
              </Text>
              <DisplayCurrency coin={accountBalanceCoin} className='text-white text-base mb-0.5' />
              <FormattedNumber
                amount={demagnify(accountBalance, asset)}
                className='text-sm text-gray-400'
                options={{ suffix: ` ${asset.symbol}`, maxDecimals: asset.decimals }}
              />
            </div>
          )}

          {walletBalanceCoin && walletBalance && (
            <div className='flex flex-col'>
              <Text size='sm' className='text-gray-400 mb-1'>
                Wallet Balance
              </Text>
              <DisplayCurrency coin={walletBalanceCoin} className='text-white text-base mb-0.5' />
              <FormattedNumber
                amount={demagnify(BN(walletBalance.amount), asset)}
                className='text-sm text-gray-400'
                options={{ suffix: ` ${asset.symbol}`, maxDecimals: asset.decimals }}
              />
            </div>
          )}

          <div className='flex flex-col gap-3'>
            <Button
              text='Fund'
              color='tertiary'
              leftIcon={<ArrowUpLine />}
              disabled={!account}
              onClick={() => {
                const assetDenom = asset.chainName
                  ? `${asset.denom}:${asset.chainName}`
                  : asset.denom
                useStore.setState({
                  fundAndWithdrawModal: 'fund',
                  walletAssetsModal: {
                    selectedDenoms: [assetDenom],
                    isBorrow: false,
                  },
                })
              }}
            />
            <Button
              text='Withdraw'
              color='tertiary'
              leftIcon={<ArrowDownLine />}
              disabled={!account || mergeBNCoinArrays(account.deposits, account.lends).length === 0}
              onClick={() => {
                useStore.setState({
                  fundAndWithdrawModal: 'withdraw',
                  walletAssetsModal: {
                    selectedDenoms: [asset.denom],
                    isBorrow: false,
                  },
                })
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
