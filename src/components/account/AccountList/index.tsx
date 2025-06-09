import classNames from 'classnames'
import AccountStats from 'components/account/AccountList/AccountStats'
import AccountTitle from 'components/account/AccountTitle'
import Card from 'components/common/Card'
import Radio from 'components/common/Radio'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccounts from 'hooks/accounts/useAccounts'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useEffect, useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { checkAccountKind } from 'utils/accounts'
import { getPage, getRoute } from 'utils/route'

interface Props {
  setShowMenu: (show: boolean) => void
  isVaults?: boolean
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20',
  'group-hover/account:bg-white/30',
)

export default function AccountList(props: Props) {
  const { setShowMenu, isVaults } = props
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const currentAccountId = useAccountId()
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts('all', address)
  const filteredAccounts = useMemo(() => {
    const noHlsAccounts = accounts.filter(
      (account) => checkAccountKind(account.kind) !== 'high_levered_strategy',
    )
    const accountType = isVaults ? 'fund_manager' : 'default'
    return noHlsAccounts.filter((account) => checkAccountKind(account.kind) === accountType)
  }, [accounts, isVaults])

  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!currentAccountId) return
    const element = document.getElementById(`account-${currentAccountId}`)
    if (element) {
      const container = element.closest('.scrollbar-hide, .overflow-y-scroll')
      if (container) {
        const elementTop = element.offsetTop
        container.scrollTo({
          top: elementTop - 48,
          behavior: 'smooth',
        })
      }
    }
  }, [currentAccountId])

  if (!filteredAccounts || !filteredAccounts.length) return null

  return (
    <div className='flex flex-wrap w-full px-4 pb-4'>
      {filteredAccounts.map((account) => {
        const isActive = currentAccountId === account.id
        return (
          <div key={account.id} id={`account-${account.id}`} className='w-full pt-4'>
            <Card
              id={`account-${account.id}`}
              key={account.id}
              className={classNames('w-full', !isActive && 'group/account hover:cursor-pointer')}
              contentClassName='bg-white/10 group-hover/account:bg-white/20'
              onClick={() => {
                if (isActive) return
                if (isMobile) setShowMenu(false)
                useStore.setState({ accountDeleteModal: null })

                navigate(
                  getRoute(getPage(pathname, chainConfig), searchParams, address, account.id),
                )
              }}
              title={
                <div
                  className={accountCardHeaderClasses}
                  role='button'
                  onClick={() => setShowMenu(false)}
                >
                  <AccountTitle account={account} />
                  <Radio active={isActive} className='group-hover/account:opacity-100' />
                </div>
              }
            >
              <AccountStats account={account} isActive={isActive} setShowMenu={setShowMenu} />
            </Card>
          </div>
        )
      })}
    </div>
  )
}
