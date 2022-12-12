import BigNumber from 'bignumber.js'
import { useMemo, useRef, useState } from 'react'

import { BorrowModal, Card, RepayModal, Text } from 'components'
import { BorrowTable } from 'components/Borrow'
import { useAccountDetailsStore } from 'stores'
import { getTokenDecimals, getTokenInfo } from 'utils/tokens'
import {
  useAllowedCoins,
  useCreditAccountPositions,
  useMarkets,
  useRedbankBalances,
  useTokenPrices,
} from 'hooks/queries'

type ModalState = {
  show: 'borrow' | 'repay' | false
  data: {
    tokenDenom: string
  }
}

const Borrow = () => {
  const [modalState, setModalState] = useState<ModalState>({
    show: false,
    data: { tokenDenom: '' },
  })

  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { data: allowedCoinsData } = useAllowedCoins()
  const { data: positionsData } = useCreditAccountPositions(selectedAccount ?? '')
  const { data: marketsData } = useMarkets()
  const { data: tokenPrices } = useTokenPrices()
  const { data: redbankBalances } = useRedbankBalances()

  // recreate modals and reset state whenever ref changes
  const modalId = useRef(0)

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
    setModalState({ show: 'borrow', data: { tokenDenom: denom } })
    modalId.current += 1
  }

  const handleRepayClick = (denom: string) => {
    setModalState({ show: 'repay', data: { tokenDenom: denom } })
    modalId.current += 1
  }

  return (
    <div className='flex w-full items-start gap-4'>
      <div className='flex-1'>
        <Card className='mb-4'>
          <div>
            <Text tag='h3' size='xl' uppercase className='mb-7 text-center'>
              Borrowings
            </Text>
            <BorrowTable
              data={borrowedAssets}
              onBorrowClick={handleBorrowClick}
              onRepayClick={handleRepayClick}
            />
          </div>
        </Card>
        <Card>
          <div>
            <Text tag='h3' size='xl' uppercase className='mb-7 text-center text-lg-caps'>
              Available to Borrow
            </Text>
            <BorrowTable
              data={notBorrowedAssets}
              onBorrowClick={handleBorrowClick}
              onRepayClick={handleRepayClick}
            />
          </div>
        </Card>
      </div>
      <BorrowModal
        key={`borrowModal_${modalId.current}`}
        tokenDenom={modalState.data.tokenDenom}
        show={modalState.show === 'borrow'}
        onClose={() => setModalState({ ...modalState, show: false })}
      />
      <RepayModal
        key={`repayModal_${modalId.current}`}
        tokenDenom={modalState.data.tokenDenom}
        show={modalState.show === 'repay'}
        onClose={() => setModalState({ ...modalState, show: false })}
      />
    </div>
  )
}

export default Borrow
