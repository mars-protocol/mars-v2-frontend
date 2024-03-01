import { useShuttle } from '@delphi-labs/shuttle-react'
import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountMenu from 'components/account/AccountMenu'
import AccountSummary from 'components/account/AccountSummary'
import Card from 'components/common/Card'
import { ChevronDown } from 'components/common/Icons'
import Settings from 'components/common/Settings'
import Text from 'components/common/Text'
import ChainSelect from 'components/header/ChainSelect'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/useAccountId'
import useChainConfig from 'hooks/useChainConfig'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { getPage, getRoute } from 'utils/route'

interface Props {
  menuTree: (walletId: WalletID, chainConfig: ChainConfig) => MenuTreeEntry[]
}

export default function MobileNavigation(props: Props) {
  const { menuTree } = props
  const currentAccountId = useAccountId()
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
  const isV1 = useStore((s) => s.isV1)
  const { recentWallet } = useShuttle()
  const chainConfig = useChainConfig()
  const walletId = (recentWallet?.providerId as WalletID) ?? WalletID.Keplr
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const { pathname } = useLocation()
  const currentPage = getPage(pathname)
  const { data: account } = useAccount(isV1 ? address : currentAccountId ?? undefined)

  const menu = useMemo(() => menuTree(walletId, chainConfig), [walletId, chainConfig, menuTree])

  const selectPage = useCallback(
    (page: Page) => {
      useStore.setState({ mobileNavExpanded: false })
      if (page.includes('http')) {
        window.open(page, '_blank')
        return
      }
      navigate(getRoute(getPage(page), searchParams, address, currentAccountId))
    },
    [navigate, searchParams, address, currentAccountId],
  )

  return (
    <div
      className={classNames(
        'fixed md:hidden w-screen-full top-18 gap-4 flex flex-wrap p-2 pt-4 pb-8 transition-all overflow-y-scroll h-[calc(100dvh-72px)] z-20 items-start flex-col',
        mobileNavExpanded ? 'right-0 opacity-100' : '-right-full opacity-0',
      )}
    >
      <div className='flex items-center justify-between w-full'>
        <Text size='sm'>Outpost:</Text>
        <div className='relative'>
          <ChainSelect withText />
        </div>
      </div>
      <div className='flex items-center justify-between w-full'>
        <Text size='sm'>Page:</Text>
        <div className='relative'>
          <select
            className='py-1.5 pl-2 pr-6 text-sm text-white bg-transparent border rounded-sm appearance-none border-white/30 focus:outline-none active:outline-none'
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              selectPage(event.target.value as Page)
            }
          >
            {menu.map((item, index) => {
              if (item.submenu) {
                return item.submenu.map((subItem, subIndex) => {
                  return (
                    <option
                      key={subIndex}
                      value={subItem.page}
                      selected={subItem.page === currentPage}
                    >
                      {`${item.label} - ${subItem.label}`}
                    </option>
                  )
                })
              }

              return (
                <option
                  key={index}
                  value={item.pages[0]}
                  selected={item.pages.indexOf(currentPage as Page) !== -1}
                >
                  {item.label}
                </option>
              )
            })}
          </select>
          <div className='absolute w-3 -translate-y-1/2 right-2 top-1/2 -z-1'>
            <ChevronDown />
          </div>
        </div>
      </div>
      {!isV1 && address && (
        <div className='flex items-center justify-between w-full'>
          <Text size='sm'>Account:</Text>
          <div className='relative'>
            <AccountMenu />
          </div>
        </div>
      )}
      <p>{account?.id}</p>
      <p>{address}</p>
      {account && (
        <Card title={isV1 ? 'Red Bank' : `Credit Account ${account.id}`}>
          <AccountSummary account={account} />
        </Card>
      )}
      <div className='flex justify-end w-full'>
        <Settings showText />
      </div>
    </div>
  )
}
