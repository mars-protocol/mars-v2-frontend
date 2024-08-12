import React from 'react'
import classNames from 'classnames'
import AccountFundRow from 'components/account/AccountFund/AccountFundRow'
import { BNCoin } from 'types/classes/BNCoin'
import { BigNumber } from 'bignumber.js'

interface AccountFundingAssetsProps {
  fundingAssets: BNCoin[]
  combinedBalances: BNCoin[]
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
  return fundingAssets.map((coin, index) => (
    <div
      key={`${coin.denom}-${index}`}
      className={classNames(
        'w-full mb-4',
        isFullPage && 'w-full p-4 border rounded-base border-white/20 bg-white/5',
      )}
    >
      <AccountFundRow
        denom={coin.denom}
        balances={combinedBalances}
        amount={coin.amount}
        isConfirming={isConfirming}
        updateFundingAssets={updateFundingAssets}
        onDebounce={onDebounce}
        chainName={coin.chainName}
      />
    </div>
  ))
}
