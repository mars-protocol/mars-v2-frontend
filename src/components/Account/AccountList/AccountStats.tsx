import { useCallback, useMemo } from 'react'

import AccountFundFullPage from 'components/Account/AccountFund/AccountFundFullPage'
import Skeleton from 'components/Account/AccountList/Skeleton'
import Button from 'components/Button'
import { ArrowDownLine, ArrowUpLine, TrashBin } from 'components/Icons'
import SwitchAutoLend from 'components/Switch/SwitchAutoLend'
import useAccount from 'hooks/useAccount'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { calculateAccountApr, calculateAccountBalanceValue } from 'utils/accounts'

interface Props {
  accountId: string
  isActive?: boolean
  setShowMenu?: (show: boolean) => void
}

export default function AccountStats(props: Props) {
  const { accountId, isActive, setShowMenu } = props
  const { data: account } = useAccount(accountId)
  const { data: prices } = usePrices()
  const positionBalance = useMemo(
    () => (!account ? null : calculateAccountBalanceValue(account, prices)),
    [account, prices],
  )
  const { health, healthFactor } = useHealthComputer(account)
  const { data } = useBorrowMarketAssetsTableData(false)
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apr = useMemo(
    () =>
      !account ? null : calculateAccountApr(account, borrowAssetsData, lendingAssetsData, prices),
    [account, borrowAssetsData, lendingAssetsData, prices],
  )

  const deleteAccountHandler = useCallback(() => {
    if (!account) return
    useStore.setState({ accountDeleteModal: account })
  }, [account])

  return (
    <div className='w-full p-4'>
      <Skeleton
        health={!account ? 0 : health}
        healthFactor={!account ? 0 : healthFactor}
        positionBalance={positionBalance}
        apr={apr}
      />
      {isActive && setShowMenu && (
        <div className='grid grid-flow-row grid-cols-2 gap-4 pt-4'>
          <Button
            className='w-full'
            text='Fund'
            color='tertiary'
            leftIcon={<ArrowUpLine />}
            disabled={!positionBalance}
            onClick={() => {
              setShowMenu(false)
              if (!positionBalance) return
              if (positionBalance.isLessThanOrEqualTo(0)) {
                useStore.setState({
                  focusComponent: {
                    component: <AccountFundFullPage />,
                    onClose: () => {
                      useStore.setState({ getStartedModal: true })
                    },
                  },
                })
                return
              }
              useStore.setState({ fundAndWithdrawModal: 'fund' })
            }}
          />
          <Button
            className='w-full'
            color='tertiary'
            leftIcon={<ArrowDownLine />}
            text='Withdraw'
            onClick={() => {
              setShowMenu(false)
              useStore.setState({ fundAndWithdrawModal: 'withdraw' })
            }}
            disabled={!positionBalance || positionBalance.isLessThanOrEqualTo(0)}
          />
          <Button
            className='w-full col-span-2'
            color='tertiary'
            leftIcon={<TrashBin />}
            text='Delete'
            disabled={!account}
            onClick={() => {
              setShowMenu(false)
              deleteAccountHandler()
            }}
          />
          <SwitchAutoLend
            className='col-span-2 pt-4 border-t border-white/10'
            accountId={accountId}
          />
        </div>
      )}
    </div>
  )
}
