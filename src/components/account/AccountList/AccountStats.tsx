import { useCallback, useMemo } from 'react'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Skeleton from 'components/account/AccountList/Skeleton'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine, TrashBin } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import useAccount from 'hooks/accounts/useAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApy, calculateAccountBalanceValue } from 'utils/accounts'
import { mergeBNCoinArrays } from 'utils/helpers'

interface Props {
  accountId: string
  isActive?: boolean
  setShowMenu?: (show: boolean) => void
  isVaults?: boolean
}

export default function AccountStats(props: Props) {
  const { accountId, isActive, isVaults, setShowMenu } = props
  const assets = useWhitelistedAssets()
  const { data: account } = useAccount(accountId)
  const { data: vaultAprs } = useVaultAprs()
  const { data: perpsVault } = usePerpsVault()
  const astroLpAprs = useAstroLpAprs()
  const perpsMarketStates = usePerpsMarketStates()

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
  const apy = useMemo(
    () =>
      !account
        ? null
        : calculateAccountApy(
            account,
            borrowAssetsData,
            lendingAssetsData,
            assets,
            vaultAprs,
            astroLpAprs,
            perpsVault?.apy || 0,
            perpsMarketStates.data || [],
          ),
    [
      account,
      borrowAssetsData,
      lendingAssetsData,
      assets,
      vaultAprs,
      astroLpAprs,
      perpsVault?.apy,
      perpsMarketStates.data,
    ],
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
        isVaults={isVaults}
        apy={apy}
        risk={isVaults ? 12 : undefined}
      />
      {isActive && setShowMenu && (
        <div className='grid grid-flow-row grid-cols-2 gap-4 pt-4'>
          {!isVaults && (
            <>
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
                          // TODO: update docs to reflect the current state of v2
                          //useStore.setState({ getStartedModal: true })
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
                disabled={
                  !account || mergeBNCoinArrays(account.deposits, account.lends).length === 0
                }
              />
            </>
          )}
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
          {!isVaults && (
            <SwitchAutoLend
              className='col-span-2 pt-4 border-t border-white/10'
              accountId={accountId}
            />
          )}
        </div>
      )}
    </div>
  )
}
