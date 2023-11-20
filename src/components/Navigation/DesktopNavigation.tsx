import { useShuttle } from '@delphi-labs/shuttle-react'
import classNames from 'classnames'
import { useMemo } from 'react'

import Button from 'components/Button'
import { menuTree } from 'components/Header/DesktopHeader'
import { ChevronDown, Logo } from 'components/Icons'
import { NavLink } from 'components/Navigation/NavLink'
import useAccountId from 'hooks/useAccountId'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { getRoute } from 'utils/route'

export default function DesktopNavigation() {
  const [showMenu, setShowMenu] = useToggle()
  const { recentWallet } = useShuttle()
  const walletId = (recentWallet?.providerId as WalletID) ?? WalletID.Keplr
  const address = useStore((s) => s.address)
  const accountId = useAccountId()

  const focusComponent = useStore((s) => s.focusComponent)

  const menu = useMemo(() => menuTree(walletId), [walletId])

  function getIsActive(pages: string[]) {
    const segments = location.pathname.split('/')
    return pages.some((page) => segments.includes(page))
  }

  return (
    <div
      className={classNames(
        focusComponent ? 'absolute left-4 top-3 z-1 block' : 'flex flex-1 items-center',
      )}
    >
      <NavLink href={getRoute('trade', address, accountId)}>
        <span className='block w-10 h-10'>
          <Logo className='text-white' />
        </span>
      </NavLink>
      {!focusComponent && (
        <div className='flex gap-8 px-6 @container/navigation relative flex-1'>
          {menu.map((item, index) => (
            <NavLink
              key={index}
              href={
                item.externalUrl ? item.externalUrl : getRoute(item.pages[0], address, accountId)
              }
              isActive={getIsActive(item.pages)}
              className={`@nav-${index}/navigation:inline-block hidden whitespace-nowrap`}
              target={item.externalUrl ? '_blank' : undefined}
            >
              {item.label}
            </NavLink>
          ))}
          <div className={`@nav-${menu.length - 1}/navigation:hidden flex items-center relative`}>
            <Button
              leftIcon={<ChevronDown />}
              color='quaternary'
              variant='transparent'
              onClick={() => setShowMenu(!showMenu)}
              text='More'
              className='!text-base !p-0 !min-h-0'
            />
            <div
              className={classNames(
                showMenu ? 'flex' : 'hidden',
                'absolute left-0 top-[calc(100%+4px)]',
              )}
            >
              <ul
                className={classNames(
                  'py-4 list-none flex flex-wrap gap-2 bg-white/10 backdrop-blur-lg',
                  'relative isolate max-w-full overflow-hidden rounded-sm',
                  'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
                )}
              >
                {menu.map((item, index) => (
                  <li className={`@nav-${index}/navigation:hidden block w-full m-0`} key={index}>
                    <NavLink
                      href={
                        item.externalUrl
                          ? item.externalUrl
                          : getRoute(item.pages[0], address, accountId)
                      }
                      onClick={() => setShowMenu(false)}
                      isActive={getIsActive(item.pages)}
                      className='w-full px-4 whitespace-nowrap'
                      target={item.externalUrl ? '_blank' : undefined}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
