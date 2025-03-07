import AccountStats from 'components/account/AccountList/AccountStats'
import Card from 'components/common/Card'
import classNames from 'classnames'
import Radio from 'components/common/Radio'
import Text from 'components/common/Text'
import useAccount from 'hooks/accounts/useAccount'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'
import { isMobile } from 'react-device-detect'
import { useNavigate } from 'react-router-dom'

interface AccountCardProps {
  accountId: string
  isActive: boolean
  setShowMenu: (show: boolean) => void
  pathname: string
  chainConfig: any
  searchParams: URLSearchParams
  address: string | undefined
  showUSDCMarginOnly?: boolean
}

export default function AccountCard(props: AccountCardProps) {
  const {
    accountId,
    isActive,
    setShowMenu,
    pathname,
    chainConfig,
    searchParams,
    address,
    showUSDCMarginOnly,
  } = props

  const navigate = useNavigate()
  const { data: account } = useAccount(accountId)
  const isUSDC = account?.kind === 'usdc'

  if (showUSDCMarginOnly && !isUSDC) return null
  if (!showUSDCMarginOnly && isUSDC) return null

  return (
    <div key={accountId} id={`account-${accountId}`} className='w-full pt-4 scrollbar-hide'>
      <Card
        id={`account-${accountId}`}
        key={accountId}
        className={classNames('w-full', !isActive && 'group/account hover:cursor-pointer')}
        contentClassName='bg-white/10 group-hover/account:bg-white/20'
        onClick={() => {
          if (isActive) return
          if (isMobile) setShowMenu(false)
          useStore.setState({ accountDeleteModal: null })
          if (isUSDC) {
            navigate(`/perps?accountId=${accountId}`)
          } else {
            navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, accountId))
          }
        }}
        title={
          <div
            className={classNames(
              'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
              'border border-transparent border-b-white/20',
              'group-hover/account:bg-white/30',
            )}
            role='button'
            onClick={() => setShowMenu(false)}
          >
            <div className='flex items-center gap-2'>
              <Text size='xs' className='flex flex-1'>
                Credit Account {accountId}
              </Text>
              {isUSDC && (
                <span className='px-2 py-0.5 text-xs bg-white/20 rounded-md text-white/70'>
                  USDC Margin
                </span>
              )}
            </div>
            <Radio active={isActive} className='group-hover/account:opacity-100' />
          </div>
        }
      >
        <AccountStats accountId={accountId} isActive={isActive} setShowMenu={setShowMenu} />
      </Card>
    </div>
  )
}
