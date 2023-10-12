import classNames from 'classnames'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AccountStats from 'components/Account/AccountList/AccountStats'
import Card from 'components/Card'
import Radio from 'components/Radio'
import Text from 'components/Text'
import useAccountId from 'hooks/useAccountId'
import useAccountIds from 'hooks/useAccountIds'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  setShowMenu: (show: boolean) => void
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20',
  'group-hover/account:bg-white/30',
)

export default function AccountList(props: Props) {
  const { setShowMenu } = props
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const currentAccountId = useAccountId()
  const address = useStore((s) => s.address)
  const { data: accountIds } = useAccountIds(address)

  useEffect(() => {
    if (!currentAccountId) return
    const element = document.getElementById(`account-${currentAccountId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentAccountId])

  if (!accountIds?.length) return null

  return (
    <div className='flex flex-wrap w-full p-4'>
      {accountIds.map((accountId) => {
        const isActive = currentAccountId === accountId

        return (
          <div key={accountId} id={`account-${accountId}`} className='w-full pt-4'>
            <Card
              id={`account-${accountId}`}
              key={accountId}
              className={classNames('w-full', !isActive && 'group/account hover:cursor-pointer')}
              contentClassName='bg-white/10 group-hover/account:bg-white/20'
              onClick={() => {
                if (isActive) return
                useStore.setState({ accountDeleteModal: null })
                navigate(getRoute(getPage(pathname), address, accountId))
              }}
              title={
                <div className={accountCardHeaderClasses} role={!isActive ? 'button' : undefined}>
                  <Text size='xs' className='flex flex-1'>
                    Credit Account {accountId}
                  </Text>
                  <Radio active={isActive} className='group-hover/account:opacity-100' />
                </div>
              }
            >
              <AccountStats accountId={accountId} isActive={isActive} setShowMenu={setShowMenu} />
            </Card>
          </div>
        )
      })}
    </div>
  )
}
