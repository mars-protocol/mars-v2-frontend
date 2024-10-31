import AccountVaultStats from 'components/account/AccountVaultList/AccountVaultStats'
import Card from 'components/common/Card'
import Radio from 'components/common/Radio'
import Text from 'components/common/Text'
import VaultDetails from 'components/vaults/community/vaultDetails'
import useAccountIds from 'hooks/accounts/useAccountIds'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'
import classNames from 'classnames'
import { getPage, getRoute } from 'utils/route'
import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isMobile } from 'react-device-detect'

interface Props {
  setShowMenu: (show: boolean) => void
}

const accountCardHeaderClasses = classNames(
  'flex w-full items-center justify-between bg-white/20 px-4 py-2.5 text-white/70',
  'border border-transparent border-b-white/20',
  'group-hover/account:bg-white/30',
)

export default function AccountVaultList(props: Props) {
  const { setShowMenu } = props

  const navigate = useNavigate()
  const currentAccountId = useAccountId()
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const { data: accountIds } = useAccountIds(address, true, true)

  const handleCardClick = useCallback(
    (accountId: string, isActive: boolean) => {
      if (isActive) return
      if (isMobile) setShowMenu(false)

      const tempVaultAddress = 'tempvaultaddress'

      navigate(
        getRoute(getPage(`vaults/${tempVaultAddress}/details`), searchParams, address, accountId),
      )

      useStore.setState({
        focusComponent: {
          component: <VaultDetails />,
        },
      })
    },
    [navigate, searchParams, setShowMenu, address],
  )

  if (!accountIds || !accountIds.length) return null

  return (
    <div className='flex flex-wrap w-full p-4'>
      {/* temporary mapping through accIds - TODO: map through vaults */}
      {accountIds.map((accountId, index) => {
        const isActive = currentAccountId === accountId

        return (
          <div key={accountId} className={classNames('w-full', index > 0 && 'pt-4')}>
            <Card
              id={`account-${accountId}`}
              key={accountId}
              className={classNames('w-full', !isActive && 'group/account hover:cursor-pointer')}
              contentClassName='bg-white/10 group-hover/account:bg-white/20'
              onClick={() => handleCardClick(accountId, isActive)}
              title={
                <div
                  className={accountCardHeaderClasses}
                  role='button'
                  onClick={() => setShowMenu(false)}
                >
                  <Text size='xs'>
                    {/* TODO: dynamic name */}
                    Vault Name
                  </Text>
                  <Radio active={isActive} className='group-hover/account:opacity-100' />
                </div>
              }
            >
              <AccountVaultStats isActive={isActive} setShowMenu={setShowMenu} />
            </Card>
          </div>
        )
      })}
    </div>
  )
}
