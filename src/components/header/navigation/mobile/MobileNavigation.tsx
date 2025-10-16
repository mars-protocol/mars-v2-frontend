import classNames from 'classnames'

import AccountMenu from 'components/account/AccountMenu'
import AccountSummary from 'components/account/AccountSummary'
import Card from 'components/common/Card'
import { ChevronDown, Discord, Telegram, Twitter } from 'components/common/Icons'
import Settings from 'components/common/Settings'
import Text from 'components/common/Text'
import ChainSelect from 'components/header/ChainSelect'
import RewardsCenter from 'components/header/RewardsCenter'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountTitle from 'hooks/accounts/useAccountTitle'
import useChainConfig from 'hooks/chain/useChainConfig'
import useV1Account from 'hooks/v1/useV1Account'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { DocURL } from 'types/enums'
import { getPage, getRoute } from 'utils/route'

interface Props {
  menuTree: (chainConfig: ChainConfig) => MenuTreeEntry[]
}

export default function MobileNavigation(props: Props) {
  const isV1 = useStore((s) => s.isV1)

  if (isV1) return <V1Controller {...props} />

  return <Controller {...props} />
}

function V1Controller(props: Props) {
  const { data: account } = useV1Account()

  return <Content {...props} account={account} />
}

function Controller(props: Props) {
  const currentAccountId = useAccountId()
  const { data: account } = useAccount(currentAccountId ?? undefined)

  return <Content {...props} account={account} />
}

function Content(props: Props & { account?: Account }) {
  const { menuTree, account } = props
  const currentAccountId = useAccountId()
  const mobileNavExpanded = useStore((s) => s.mobileNavExpanded)
  const isV1 = useStore((s) => s.isV1)
  const chainConfig = useChainConfig()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const { pathname } = useLocation()
  const currentPage = getPage(pathname, chainConfig)

  const menu = useMemo(() => menuTree(chainConfig), [chainConfig, menuTree])
  const accountTitle = useAccountTitle(account, true)

  useEffect(() => {
    if (mobileNavExpanded) {
      document.body.classList.add('h-screen-full', 'overflow-hidden')
    } else {
      document.body.classList.remove('h-screen-full', 'overflow-hidden')
    }

    return () => {
      document.body.classList.remove('h-screen-full', 'overflow-hidden')
    }
  }, [mobileNavExpanded])

  const selectPage = useCallback(
    (page: Page) => {
      window.scrollTo(0, 0)
      if (typeof window !== 'undefined') setTimeout(() => window.scrollTo(0, 0), 200)
      useStore.setState({ mobileNavExpanded: false })
      if (page.includes('http')) {
        window.open(page, '_blank')
        return
      }
      navigate(getRoute(getPage(page, chainConfig), searchParams, address, currentAccountId))
    },
    [navigate, chainConfig, searchParams, address, currentAccountId],
  )

  return (
    <nav
      className={classNames(
        'fixed md:hidden max-w-screen-full w-screen-full top-18 p-2 pt-4 pb-20 transition-all overflow-y-scroll h-[calc(100dvh-72px)] z-20 items-start',
        mobileNavExpanded ? 'right-0 opacity-100' : '-right-full opacity-0',
      )}
    >
      <div className='flex flex-wrap gap-4'>
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
              defaultValue={currentPage}
            >
              {menu.map((item) => {
                if (item.submenu) {
                  return item.submenu
                    .filter((subItem) => !subItem.isSeparator && !subItem.icon)
                    .map((subItem) => {
                      const value = subItem.page || subItem.externalUrl || ''
                      return (
                        <option key={value} value={value}>
                          {`${item.label} - ${subItem.label}`}
                        </option>
                      )
                    })
                }

                return (
                  <option key={item.pages[0]} value={item.pages[0]}>
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
        {address && account && (
          <div className='flex items-center justify-between w-full'>
            <Text size='sm'>Rewards Center:</Text>
            <div className='relative'>
              <RewardsCenter />
            </div>
          </div>
        )}
        <div className='flex items-center justify-between w-full'>
          <Text size='sm'>Socials:</Text>
          <div className='flex gap-4'>
            <a
              href={DocURL.DISCORD_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-white/60 hover:text-white transition-colors'
            >
              <Discord className='w-6 h-6' />
            </a>
            <a
              href={DocURL.TELEGRAM_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-white/60 hover:text-white transition-colors'
            >
              <Telegram className='w-6 h-6' />
            </a>
            <a
              href={DocURL.X_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-white/60 hover:text-white transition-colors'
            >
              <Twitter className='w-6 h-6' />
            </a>
          </div>
        </div>
        {account && (
          <div className='flex w-full'>
            <Card title={isV1 ? 'Red Bank' : accountTitle}>
              <AccountSummary account={account} />
            </Card>
          </div>
        )}
        <div className='flex justify-end w-full'>
          <Settings showText />
        </div>
      </div>
    </nav>
  )
}
