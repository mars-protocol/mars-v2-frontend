import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Skeleton from 'components/account/AccountList/Skeleton'
import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine, ThreeDots, TrashBin } from 'components/common/Icons'
import SwitchAutoLend from 'components/common/Switch/SwitchAutoLend'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useAstroLpAprs from 'hooks/astroLp/useAstroLpAprs'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import usePerpsMarketStates from 'hooks/perps/usePerpsMarketStates'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { calculateAccountApy, calculateAccountBalanceValue, checkAccountKind } from 'utils/accounts'
import { mergeBNCoinArrays } from 'utils/helpers'
import { getRoute } from 'utils/route'

interface Props {
  account: Account
  isActive?: boolean
  setShowMenu?: (show: boolean) => void
}

export default function AccountStats(props: Props) {
  const { account, isActive, setShowMenu } = props
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const isVault = checkAccountKind(account.kind) === 'fund_manager'
  const { data: assets } = useAssets()
  const { data: vaultAprs } = useVaultAprs()
  const { data: perpsVault } = usePerpsVault()
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

  const perpsMarketStates = usePerpsMarketStates()

  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apy = useMemo(
    () =>
      !account
        ? BN_ZERO
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

  const navigateToVaultDetails = useCallback(() => {
    if (!account) return
    const vaultAddress =
      typeof account.kind === 'object' && 'fund_manager' in account.kind
        ? account.kind.fund_manager.vault_addr
        : ''
    navigate(getRoute(`vaults/${vaultAddress}/details` as Page, searchParams, address))
  }, [account, navigate, searchParams, address])

  return (
    <div className='w-full p-4'>
      <Skeleton
        health={health ?? 0}
        healthFactor={healthFactor ?? 0}
        positionBalance={positionBalance}
        isVault={isVault}
        apy={apy}
        risk={isVault ? 12 : undefined}
      />
      {isActive && setShowMenu && (
        <div className='grid grid-flow-row grid-cols-2 gap-4 pt-4'>
          {isVault ? (
            <Button
              className='w-full col-span-2'
              color='tertiary'
              leftIcon={<ThreeDots />}
              text='Details'
              onClick={navigateToVaultDetails}
            />
          ) : (
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
            </>
          )}
          <SwitchAutoLend
            className='col-span-2 pt-4 border-t border-white/10'
            accountId={account.id}
          />
        </div>
      )}
    </div>
  )
}
