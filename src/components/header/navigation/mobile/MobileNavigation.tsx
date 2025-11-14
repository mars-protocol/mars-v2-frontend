import classNames from 'classnames'

import AccountMenu from 'components/account/AccountMenu'
import AccountSummary from 'components/account/AccountSummary'
import Card from 'components/common/Card'
import { Check, ChevronDown, Discord, Telegram, Twitter } from 'components/common/Icons'
import Settings from 'components/common/Settings'
import Text from 'components/common/Text'
import ChainSelect from 'components/header/ChainSelect'
import RewardsCenter from 'components/header/RewardsCenter'
import useAccount from 'hooks/accounts/useAccount'
import useAccountId from 'hooks/accounts/useAccountId'
import useAccountTitle from 'hooks/accounts/useAccountTitle'
import useChainConfig from 'hooks/chain/useChainConfig'
import useV1Account from 'hooks/v1/useV1Account'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const menu = useMemo(() => menuTree(chainConfig), [chainConfig, menuTree])
  const accountTitle = useAccountTitle(account, true)

  const menuItems = useMemo(() => {
    const items: Array<{ value: string; label: string }> = []
    for (const item of menu) {
      if (item.submenu) {
        const filteredItems = item.submenu.filter(
          (subItem) => !subItem.isSeparator && !subItem.hideOnDesktop,
        )
        for (const subItem of filteredItems) {
          const value = subItem.page || subItem.externalUrl || ''
          items.push({ value, label: subItem.label })
        }
      } else {
        items.push({ value: item.pages[0], label: item.label })
      }
    }
    return items
  }, [menu])

  const currentPageLabel = useMemo(() => {
    const item = menuItems.find((item) => item.value === currentPage)
    return item?.label || 'Select Page'
  }, [menuItems, currentPage])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const selectPage = useCallback(
    (page: Page) => {
      setIsDropdownOpen(false)
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
          <div className='relative' ref={dropdownRef}>
            <button
              className='py-1.5 pl-2 pr-6 text-sm text-white bg-transparent border rounded-sm border-white/30 focus:outline-none active:outline-none leading-normal min-w-35 text-left'
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {currentPageLabel}
            </button>
            <div className='absolute w-3 -translate-y-1/2 right-2 top-1/2 pointer-events-none'>
              <ChevronDown />
            </div>
            {isDropdownOpen && (
              <div className='absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/30 rounded-sm max-h-[400px] overflow-y-auto z-80'>
                {menuItems.map((item) => (
                  <button
                    key={item.value}
                    className='w-full px-2 py-2 text-sm text-left hover:bg-white/20 transition-colors flex items-center gap-2'
                    onClick={() => selectPage(item.value as Page)}
                  >
                    <span className='w-4 h-4 flex items-center justify-center shrink-0'>
                      {item.value === currentPage && <Check className='w-4 h-4 text-white' />}
                    </span>
                    <span className='text-white flex-1'>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
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
