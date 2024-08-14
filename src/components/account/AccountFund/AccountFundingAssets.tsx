import React from 'react'
import classNames from 'classnames'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import { WrappedBNCoin } from 'types/classes/WrappedBNCoin'
import { BigNumber } from 'bignumber.js'

interface AccountFundingAssetsProps {
  fundingAssets: WrappedBNCoin[]
  combinedBalances: WrappedBNCoin[]
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string, chainName?: string) => void
  onDebounce: () => void
  isFullPage?: boolean
}

export default function AccountFundingAssets({
  fundingAssets,
  combinedBalances,
  isConfirming,
  updateFundingAssets,
  onDebounce,
  isFullPage,
}: AccountFundingAssetsProps) {
  return fundingAssets.map((wrappedCoin, index) => (
    <div
      key={`${wrappedCoin.coin.denom}-${index}`}
      className={classNames(
        'w-full mb-4',
        isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
      )}
    >
      <AccountFundRow
        denom={wrappedCoin.coin.denom}
        balances={combinedBalances}
        amount={wrappedCoin.coin.amount}
        isConfirming={isConfirming}
        updateFundingAssets={updateFundingAssets}
        onDebounce={onDebounce}
        chainName={wrappedCoin.chain}
      />
    </div>
  ))
}
