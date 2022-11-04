import React, { useRef, useState } from 'react'
import BigNumber from 'bignumber.js'

import Button from '../Button'
import { formatCurrency } from 'utils/formatters'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import { getTokenDecimals, getTokenSymbol } from 'utils/tokens'
import useTokenPrices from 'hooks/useTokenPrices'
import useAccountStats from 'hooks/useAccountStats'
import useMarkets from 'hooks/useMarkets'
import ContainerSecondary from 'components/ContainerSecondary'
import WithdrawModal from 'components/WithdrawModal'
import FundAccountModal from 'components/FundAccountModal'

const CreditManager = () => {
  const [showFundWalletModal, setShowFundWalletModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // recreate modals and reset state whenever ref changes
  const modalId = useRef(0)

  const address = useWalletStore((s) => s.address)
  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: positionsData, isLoading: isLoadingPositions } = useCreditAccountPositions(
    selectedAccount ?? ''
  )

  const { data: tokenPrices } = useTokenPrices()
  const { data: marketsData } = useMarkets()
  const accountStats = useAccountStats()

  const getTokenTotalUSDValue = (amount: string, denom: string) => {
    // early return if prices are not fetched yet
    if (!tokenPrices) return 0

    return (
      BigNumber(amount)
        .div(10 ** getTokenDecimals(denom))
        .toNumber() * tokenPrices[denom]
    )
  }

  if (!address) {
    return (
      <div className="absolute inset-0 left-auto w-[400px] border-l border-white/20 bg-background-2 p-2">
        <ContainerSecondary>You must have a connected wallet</ContainerSecondary>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 left-auto w-[400px] border-l border-white/20 bg-background-2 p-2">
      <ContainerSecondary className="mb-2 flex gap-3">
        <Button
          className="flex-1 rounded-md"
          onClick={() => {
            setShowFundWalletModal(true)
            modalId.current += 1
          }}
        >
          Fund
        </Button>
        <Button
          className="flex-1 rounded-md"
          onClick={() => {
            setShowWithdrawModal(true)
            modalId.current += 1
          }}
          disabled={!positionsData || positionsData.coins.length === 0}
        >
          Withdraw
        </Button>
      </ContainerSecondary>
      <ContainerSecondary className="mb-2 text-sm">
        <div className="mb-1 flex justify-between">
          <div>Total Position:</div>
          <div className="font-semibold">{formatCurrency(accountStats?.totalPosition ?? 0)}</div>
        </div>
        <div className="flex justify-between">
          <div>Total Liabilities:</div>
          <div className="font-semibold">{formatCurrency(accountStats?.totalDebt ?? 0)}</div>
        </div>
      </ContainerSecondary>
      <ContainerSecondary>
        <h4 className="font-bold">Balances</h4>
        {isLoadingPositions ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="flex text-xs font-semibold">
              <div className="flex-1">Asset</div>
              <div className="flex-1">Value</div>
              <div className="flex-1">Size</div>
              <div className="flex-1">APY</div>
            </div>
            {positionsData?.coins.map((coin) => (
              <div key={coin.denom} className="flex text-xs text-black/40">
                <div className="flex-1">{getTokenSymbol(coin.denom)}</div>
                <div className="flex-1">
                  {formatCurrency(getTokenTotalUSDValue(coin.amount, coin.denom))}
                </div>
                <div className="flex-1">
                  {BigNumber(coin.amount)
                    .div(10 ** getTokenDecimals(coin.denom))
                    .toNumber()
                    .toLocaleString(undefined, {
                      maximumFractionDigits: getTokenDecimals(coin.denom),
                    })}
                </div>
                <div className="flex-1">-</div>
              </div>
            ))}
            {positionsData?.debts.map((coin) => (
              <div key={coin.denom} className="flex text-xs text-red-500">
                <div className="flex-1 text-black/40">{getTokenSymbol(coin.denom)}</div>
                <div className="flex-1">
                  -{formatCurrency(getTokenTotalUSDValue(coin.amount, coin.denom))}
                </div>
                <div className="flex-1">
                  -
                  {BigNumber(coin.amount)
                    .div(10 ** getTokenDecimals(coin.denom))
                    .toNumber()
                    .toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
                </div>
                <div className="flex-1">
                  -{(Number(marketsData?.[coin.denom].borrow_rate) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </>
        )}
      </ContainerSecondary>
      <FundAccountModal
        key={`fundModal_${modalId.current}`}
        show={showFundWalletModal}
        onClose={() => setShowFundWalletModal(false)}
      />
      <WithdrawModal
        key={`withdrawModal_${modalId.current}`}
        show={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />
    </div>
  )
}

export default CreditManager
