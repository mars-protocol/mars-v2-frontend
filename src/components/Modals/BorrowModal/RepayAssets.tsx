import BigNumber from 'bignumber.js'
import React from 'react'

import Button from 'components/common/Button'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { BN } from 'utils/helpers'
import { byDenom } from 'utils/array'

export const getAssetBalance = (
  asset: Asset,
  repayFromWallet: boolean,
  walletBalances: Coin[],
  deposits: Coin[],
  lends: Coin[],
): BigNumber => {
  if (repayFromWallet) {
    return BN(walletBalances.find(byDenom(asset.denom))?.amount ?? 0)
  }

  const depositAmount = deposits.find(byDenom(asset.denom))?.amount ?? BN_ZERO
  const lendAmount = lends.find(byDenom(asset.denom))?.amount ?? BN_ZERO
  return BN(depositAmount).plus(BN(lendAmount))
}

export const getButtonText = (
  isLoading: boolean,
  action: 'none' | 'borrow' | 'repay' | 'simulation',
  isRepay: boolean,
) => {
  if (isLoading) {
    switch (action) {
      case 'borrow':
        return 'Borrowing...'
      case 'repay':
        return 'Repaying...'
      case 'simulation':
        return 'Calculating...'
      default:
        return 'Processing...'
    }
  }
  return isRepay ? 'Repay' : 'Borrow'
}

interface RepayAssetsProps {
  useDebtAsset: boolean
  selectedSwapAsset: Asset | null
  asset: Asset
  debtAssetAmount: BigNumber
  debtAssetMax: BigNumber
  swapAssetAmount: BigNumber
  adjustedSwapAssetMax: BigNumber
  remainingDebt: BigNumber
  totalRepayable: BigNumber
  handleDebtAssetChange: (val: BigNumber) => void
  handleSwapAssetChange: (val: BigNumber) => void
  accountHasRepaymentAssets: boolean
  hasDebtAsset: boolean
  openAssetSelectionModal: () => void
  account: Account
}

export function RepayAssets({
  useDebtAsset,
  selectedSwapAsset,
  asset,
  debtAssetAmount,
  debtAssetMax,
  swapAssetAmount,
  adjustedSwapAssetMax,
  remainingDebt,
  totalRepayable,
  handleDebtAssetChange,
  handleSwapAssetChange,
  accountHasRepaymentAssets,
  hasDebtAsset,
  openAssetSelectionModal,
  account,
}: RepayAssetsProps) {
  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <Text>Select Assets to Repay</Text>
        {accountHasRepaymentAssets && (
          <Button
            text='Select Assets'
            color='tertiary'
            rightIcon={<Plus />}
            iconClassName='w-3'
            onClick={openAssetSelectionModal}
          />
        )}
      </div>

      {!useDebtAsset && !selectedSwapAsset ? (
        <div className='flex flex-col items-center justify-center py-10 text-center'>
          <Text className='mb-2'>No assets selected for repayment</Text>
          <Text size='xs' className='text-white/50 mb-4'>
            Click "Select Assets" to choose which assets to use for repayment
          </Text>
        </div>
      ) : (
        <div className='space-y-4'>
          {useDebtAsset && hasDebtAsset && (
            <div>
              <Text size='sm' className='mb-2 text-white/70'>
                Debt Asset {asset.symbol && `(${asset.symbol})`}
              </Text>
              <TokenInputWithSlider
                asset={asset}
                onChange={handleDebtAssetChange}
                amount={debtAssetAmount}
                max={debtAssetMax}
                disabled={false}
                className='w-full'
                maxText='Repay All'
                warningMessages={[]}
                balances={account.deposits}
                accountId={account.id}
                hasSelect={false}
              />

              <Text size='xs' className='mt-2 text-white/50'>
                Full repayment will clear all remaining debt including dust
              </Text>

              {debtAssetAmount.isGreaterThan(0) && debtAssetAmount.isLessThan(totalRepayable) && (
                <Text size='xs' className='mt-2 text-white/50'>
                  Remaining debt:{' '}
                  <FormattedNumber
                    amount={remainingDebt.toNumber()}
                    options={{
                      decimals: asset.decimals,
                      suffix: ` ${asset.symbol}`,
                    }}
                  />
                </Text>
              )}
            </div>
          )}

          {selectedSwapAsset && (
            <div>
              <Text size='sm' className='mb-2 text-white/70'>
                Swap {selectedSwapAsset.symbol} to {asset.symbol}
              </Text>
              <TokenInputWithSlider
                asset={selectedSwapAsset}
                onChange={handleSwapAssetChange}
                amount={swapAssetAmount}
                max={adjustedSwapAssetMax}
                disabled={false}
                className='w-full'
                maxText='Max'
                warningMessages={[]}
                balances={account.deposits}
                accountId={account.id}
                hasSelect={false}
              />

              <Text size='xs' className='mt-2 text-white/50'>
                Your assets will be swapped to {asset.symbol} and will clear all debt including dust
              </Text>
            </div>
          )}
        </div>
      )}
    </>
  )
}
