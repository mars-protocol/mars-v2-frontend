import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'

import Container from 'components/Container'
import useAllowedCoins from 'hooks/useAllowedCoins'
import { getTokenDecimals, getTokenInfo } from 'utils/tokens'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import { BorrowFunds, RepayFunds } from 'components/Borrow'
import BorrowTable from 'components/Borrow/BorrowTable'
import useRedbankBalances from 'hooks/useRedbankBalances'

type ModuleState =
  | {
      show: 'borrow'
      data: {
        tokenDenom: string
      }
    }
  | {
      show: 'repay'
      data: {
        tokenDenom: string
        amount: number
      }
    }

const Borrow = () => {
  const [moduleState, setModuleState] = useState<ModuleState | null>(null)

  const selectedAccount = useCreditManagerStore((s) => s.selectedAccount)

  const { data: allowedCoinsData } = useAllowedCoins()
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  const borrowedAssetsMap = useMemo(() => {
    let borrowedAssetsMap: Map<string, string> = new Map()

    positionsData?.debts.forEach((coin) => {
      borrowedAssetsMap.set(coin.denom, coin.amount)
    })

    return borrowedAssetsMap
  }, [positionsData])

  const { borrowedAssets, notBorrowedAssets } = useMemo(() => {
    return {
      borrowedAssets:
        allowedCoinsData
          ?.filter((denom) => borrowedAssetsMap.has(denom))
          .map((denom) => {
            const { symbol, chain, icon } = getTokenInfo(denom)
            const borrowRate = Number(marketsData?.[denom].borrow_rate) || 0
            const marketLiquidity = BigNumber(redbankBalances?.[denom] ?? 0)
              .div(10 ** getTokenDecimals(denom))
              .toNumber()

            const borrowAmount = BigNumber(borrowedAssetsMap.get(denom) as string)
              .div(10 ** getTokenDecimals(denom))
              .toNumber()
            const borrowValue = borrowAmount * (tokenPrices?.[denom] ?? 0)

            const rowData = {
              denom,
              symbol,
              icon,
              chain,
              borrowed: {
                amount: borrowAmount,
                value: borrowValue,
              },
              borrowRate,
              marketLiquidity,
            }

            return rowData
          }) ?? [],
      notBorrowedAssets:
        allowedCoinsData
          ?.filter((denom) => !borrowedAssetsMap.has(denom))
          .map((denom) => {
            const { symbol, chain, icon } = getTokenInfo(denom)
            const borrowRate = Number(marketsData?.[denom].borrow_rate) || 0
            const marketLiquidity = BigNumber(redbankBalances?.[denom] ?? 0)
              .div(10 ** getTokenDecimals(denom))
              .toNumber()

            const rowData = {
              denom,
              symbol,
              icon,
              chain,
              borrowed: null,
              borrowRate,
              marketLiquidity,
            }

            return rowData
          }) ?? [],
    }
  }, [allowedCoinsData, borrowedAssetsMap, marketsData, redbankBalances, tokenPrices])

  const handleBorrowClick = (denom: string) => {
    setModuleState({ show: 'borrow', data: { tokenDenom: denom } })
  }

  const handleRepayClick = (denom: string, repayAmount: number) => {
    setModuleState({ show: 'repay', data: { tokenDenom: denom, amount: repayAmount } })
  }

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1">
        <Container>
          <div className="mb-5">
            <h3 className="mb-1 text-center font-medium uppercase">Borrowed</h3>
            <BorrowTable
              data={borrowedAssets}
              onBorrowClick={handleBorrowClick}
              onRepayClick={handleRepayClick}
            />
          </div>
          <div>
            <h3 className="mb-1 text-center font-medium uppercase">Not Borrowed Yet</h3>
            <BorrowTable
              data={notBorrowedAssets}
              onBorrowClick={handleBorrowClick}
              onRepayClick={handleRepayClick}
            />
          </div>
        </Container>
      </div>
      {moduleState?.show === 'borrow' && (
        <BorrowFunds
          key={`borrow_${selectedAccount}_${moduleState.data.tokenDenom}`}
          {...moduleState.data}
          onClose={() => setModuleState(null)}
        />
      )}
      {moduleState?.show === 'repay' && (
        <RepayFunds
          key={`repay_${selectedAccount}_${moduleState.data.tokenDenom}`}
          {...moduleState.data}
          onClose={() => setModuleState(null)}
        />
      )}
    </div>
  )
}

export default Borrow
