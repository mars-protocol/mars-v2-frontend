import { useCallback, useMemo } from 'react'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Button from 'components/common/Button'
import { ArrowDownLine, ArrowUpLine, TrashBin } from 'components/common/Icons'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { calculateAccountBalanceValue } from 'utils/accounts'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
}

export default function ManageAccount(props: Props) {
  const { account } = props
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const { data: assets } = useAssets()
  const isHls = account.kind === 'high_levered_strategy'
  const positionBalance = useMemo(
    () => (!account ? null : calculateAccountBalanceValue(account, assets)),
    [account, assets],
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
                navigate(
                  getRoute(getPage(pathname, chainConfig), searchParams, address, account.id),
                )
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
              navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, account.id))
            }}
          />
          <Button
            color='tertiary'
            leftIcon={<ArrowDownLine />}
            text='Withdraw'
            onClick={() => {
              navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, account.id))
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
