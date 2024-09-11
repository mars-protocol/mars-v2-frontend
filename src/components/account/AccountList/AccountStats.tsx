import { useCallback, useMemo } from 'react'

import AccountFundFullPage from 'AccountFund/AccountFundFullPage'
import useBorrowMarketAssetsTableData from 'borrow/Table/useBorrowMarketAssetsTableData'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine, TrashBin } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import useLendingMarketAssetsTableData from 'earn/lend/Table/useLendingMarketAssetsTableData'
import useAccount from 'hooks/accounts/useAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useHlsStakingAssets from 'hooks/hls/useHlsStakingAssets'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApr, calculateAccountBalanceValue } from 'utils/accounts'
import { mergeBNCoinArrays } from 'utils/helpers'
import Skeleton from './Skeleton'

interface Props {
  accountId: string
  isActive?: boolean
  setShowMenu?: (show: boolean) => void
}

export default function AccountStats(props: Props) {
  const { accountId, isActive, setShowMenu } = props
  const assets = useWhitelistedAssets()
  const { data: account } = useAccount(accountId)
  const { data: hlsStrategies } = useHlsStakingAssets()
  const { data: vaultAprs } = useVaultAprs()
  const astroLpAprs = useAstroLpAprs()
  const positionBalance = useMemo(
    () => (!account ? null : calculateAccountBalanceValue(account, assets)),
    [account, assets],
  )
  const { health, healthFactor } = useHealthComputer(account)
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apr = useMemo(
    () =>
      !account
        ? null
        : calculateAccountApr(
            account,
            borrowAssetsData,
            lendingAssetsData,
            hlsStrategies,
            assets,
            vaultAprs,
            astroLpAprs,
            account.kind === 'high_levered_strategy',
          ),
    [account, assets, borrowAssetsData, hlsStrategies, lendingAssetsData, vaultAprs, astroLpAprs],
  )

  const deleteAccountHandler = useCallback(() => {
    if (!account) return
    useStore.setState({ accountDeleteModal: account })
  }, [account])

  return (
    <div className='w-full p-4'>
      <Skeleton
        health={health ?? 0}
        healthFactor={healthFactor ?? 0}
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
            disabled={!account || mergeBNCoinArrays(account.deposits, account.lends).length === 0}
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
