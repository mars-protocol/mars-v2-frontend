import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/solid'
import BigNumber from 'bignumber.js'

import Container from 'components/Container'
import Button from 'components/Button'
import useAllowedCoins from 'hooks/useAllowedCoins'
import { getTokenDecimals, getTokenInfo } from 'utils/tokens'
import useCreditAccountPositions from 'hooks/useCreditAccountPositions'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useMarkets from 'hooks/useMarkets'
import useTokenPrices from 'hooks/useTokenPrices'
import { formatCurrency } from 'utils/formatters'
import BorrowFunds from 'components/Borrow/BorrowFunds'
import RepayFunds from 'components/Borrow/RepayFunds'

type AssetRowProps = {
  data: {
    denom: string
    symbol: string
    icon: string
    chain: string
    borrowed: {
      amount: number
      value: number
    } | null
    borrowRate: number
    marketLiquidity: number
  }
  onBorrowClick: () => void
  onRepayClick: (value: number) => void
}

const AssetRow = ({ data, onBorrowClick, onRepayClick }: AssetRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="cursor-pointer rounded-md bg-[#D8DAEA] px-4 py-2 text-[#585A74] hover:bg-[#D8DAEA]/90"
      onClick={() => setIsExpanded((current) => !current)}
    >
      <div className="flex">
        <div className="flex flex-1 items-center">
          <Image src={data.icon} alt="token" width={32} height={32} />
          <div className="pl-2">
            <div>{data.symbol}</div>
            <div className="text-xs">{data.chain}</div>
          </div>
        </div>
        <div className="flex flex-1 items-center text-xs">
          {data.borrowRate ? `${(data.borrowRate * 100).toFixed(2)}%` : '-'}
        </div>
        <div className="flex flex-1 items-center text-xs">
          {data.borrowed ? (
            <div>
              <div className="font-bold">{data.borrowed.amount}</div>
              <div>{formatCurrency(data.borrowed.value)}</div>
            </div>
          ) : (
            '-'
          )}
        </div>
        <div className="flex flex-1 items-center text-xs">{data.marketLiquidity}</div>
        <div className="flex w-[50px] items-center justify-end">
          {isExpanded ? <ChevronUpIcon className="w-5" /> : <ChevronDownIcon className="w-5" />}
        </div>
      </div>
      {isExpanded && (
        <div className="flex items-center justify-between">
          <div>Additional Stuff Placeholder</div>
          <div className="flex gap-2">
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onBorrowClick()
              }}
            >
              Borrow
            </Button>
            <Button
              disabled={!data.borrowed}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                if (!data.borrowed) return

                e.stopPropagation()
                onRepayClick(data.borrowed.amount)
              }}
            >
              Repay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

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

  const borrowedAssetsMap: { [key: string]: string } = useMemo(() => {
    if (!positionsData) return {}

    return positionsData?.debts.reduce((acc, coin) => {
      return {
        ...acc,
        [coin.denom]: coin.amount,
      }
    }, {})
  }, [positionsData])

  const { borrowedAssets, notBorrowedAssets } = useMemo(() => {
    const borrowedAssetsDenomsList = Object.keys(borrowedAssetsMap)

    return {
      borrowedAssets: allowedCoinsData
        ?.filter((denom) => borrowedAssetsDenomsList.includes(denom))
        .map((denom) => {
          const { symbol, chain, icon } = getTokenInfo(denom)
          const borrowRate = Number(marketsData?.[denom].borrow_rate)
          const marketLiquidity = BigNumber(marketsData?.[denom].deposit_cap ?? '')
            .div(10 ** getTokenDecimals(denom))
            .toNumber()

          const borrowAmount = BigNumber(borrowedAssetsMap[denom])
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
        }),
      notBorrowedAssets: allowedCoinsData
        ?.filter((denom) => !borrowedAssetsDenomsList.includes(denom))
        .map((denom) => {
          const { symbol, chain, icon } = getTokenInfo(denom)
          const borrowRate = Number(marketsData?.[denom].borrow_rate)
          const marketLiquidity = BigNumber(marketsData?.[denom].deposit_cap ?? '')
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
        }),
    }
  }, [allowedCoinsData, borrowedAssetsMap, marketsData, tokenPrices])

  const handleBorrowClick = (denom: string) => {
    setModuleState({ show: 'borrow', data: { tokenDenom: denom } })
  }

  const handleRepayClick = (denom: string, repayAmount: number) => {
    setModuleState({ show: 'repay', data: { tokenDenom: denom, amount: repayAmount } })
  }

  return (
    <div className="flex items-start gap-4">
      <Container className="flex-1">
        <div className="mb-5">
          <h3 className="mb-1 text-center font-medium uppercase">Borrowed</h3>
          <div className="mb-2 flex rounded-md bg-[#D8DAEA] px-4 py-2 text-xs text-[#585A74]/50">
            <div className="flex-1">Asset</div>
            <div className="flex-1">Borrow Rate</div>
            <div className="flex-1">Borrowed</div>
            <div className="flex-1">Liquidity Available</div>
            <div className="w-[50px]">Manage</div>
          </div>
          <div className="flex flex-col gap-2">
            {borrowedAssets?.length === 0
              ? 'No data'
              : borrowedAssets?.map((asset) => (
                  <AssetRow
                    key={asset.denom}
                    data={asset}
                    onBorrowClick={() => handleBorrowClick(asset.denom)}
                    onRepayClick={(repayAmount: number) => {
                      handleRepayClick(asset.denom, repayAmount)
                    }}
                  />
                ))}
          </div>
        </div>
        <div>
          <h3 className="mb-1 text-center font-medium uppercase">Not Borrowed Yet</h3>
          <div className="mb-2 flex rounded-md bg-[#D8DAEA] px-4 py-2 text-xs text-[#585A74]/50">
            <div className="flex-1">Asset</div>
            <div className="flex-1">Borrow Rate</div>
            <div className="flex-1">Borrowed</div>
            <div className="flex-1">Liquidity Available</div>
            <div className="w-[50px]">Manage</div>
          </div>
          <div className="flex flex-col gap-2">
            {notBorrowedAssets?.length === 0
              ? 'No data'
              : notBorrowedAssets?.map((asset) => (
                  <AssetRow
                    key={asset.denom}
                    data={asset}
                    onBorrowClick={() => handleBorrowClick(asset.denom)}
                    onRepayClick={(repayAmount: number) => {
                      handleRepayClick(asset.denom, repayAmount)
                    }}
                  />
                ))}
          </div>
        </div>
      </Container>
      {moduleState?.show === 'borrow' && (
        <BorrowFunds
          key={`borrow_${moduleState.data.tokenDenom}`}
          {...moduleState.data}
          onClose={() => setModuleState(null)}
        />
      )}
      {moduleState?.show === 'repay' && (
        <RepayFunds
          key={`repay_${moduleState.data.tokenDenom}`}
          {...moduleState.data}
          onClose={() => setModuleState(null)}
        />
      )}
    </div>
  )
}

export default Borrow
