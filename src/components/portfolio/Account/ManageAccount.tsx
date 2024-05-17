import { useCallback, useMemo } from 'react'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine, TrashBin } from 'components/common/Icons'
import useAllWhitelistedAssets from 'hooks/assets/useAllWhitelistedAssets'
import usePrices from 'hooks/prices/usePrices'
import useStore from 'store'
import { calculateAccountBalanceValue } from 'utils/accounts'

interface Props {
  account: Account
}

export default function ManageAccount(props: Props) {
  const { account } = props
  const assets = useAllWhitelistedAssets()
  const { data: prices } = usePrices()
  const isHls = account.kind === 'high_levered_strategy'
  const positionBalance = useMemo(
    () => (!account ? null : calculateAccountBalanceValue(account, prices, assets)),
    [account, assets, prices],
  )
  const deleteAccountHandler = useCallback(() => {
    if (!account) return
    useStore.setState({ accountDeleteModal: account })
  }, [account])

  return (
    <div className='flex flex-wrap justify-center w-full gap-4 md:justify-end'>
      {!isHls && (
        <>
          <Button
            text='Fund'
            color='tertiary'
            leftIcon={<ArrowUpLine />}
            disabled={!positionBalance}
            onClick={() => {
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
            color='tertiary'
            leftIcon={<ArrowDownLine />}
            text='Withdraw'
            onClick={() => {
              useStore.setState({ fundAndWithdrawModal: 'withdraw' })
            }}
            disabled={!positionBalance || positionBalance.isLessThanOrEqualTo(0)}
          />
        </>
      )}
      <Button
        color='tertiary'
        leftIcon={<TrashBin />}
        text='Delete'
        disabled={!account}
        onClick={() => {
          deleteAccountHandler()
        }}
      />
    </div>
  )
}
