import { useShuttle } from '@delphi-labs/shuttle-react'
import classNames from 'classnames'
import { useMemo } from 'react'

import Button from 'components/common/Button'
import { ChevronDown, Logo } from 'components/common/Icons'
import { NavLink } from 'components/header/navigation/NavLink'
import { NavMenu } from 'components/header/navigation/NavMenu'
import useChainConfig from 'hooks/useChainConfig'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'

interface Props {
  menuTree: (walletId: WalletID, chainConfig: ChainConfig) => MenuTreeEntry[]
}

export function getIsActive(pages: string[]) {
  const segments = location.pathname.split('/')
  return pages.some((page) => segments.includes(page))
}

export default function DesktopNavigation(props: Props) {
  const { menuTree } = props
  const [showMenu, setShowMenu] = useToggle()
  const { recentWallet } = useShuttle()
  const chainConfig = useChainConfig()
  const walletId = (recentWallet?.providerId as WalletID) ?? WalletID.Keplr
  const focusComponent = useStore((s) => s.focusComponent)

  const menu = useMemo(() => menuTree(walletId, chainConfig), [walletId, chainConfig, menuTree])

  return (
    <div
      className={classNames(
        focusComponent
          ? 'absolute left-4 top-3 z-1 block'
          : 'flex flex-1 items-center relative z-50',
      )}
    >
      <NavLink isHome item={menu[0]}>
        <span className='block w-10 h-10'>
          <Logo className='text-white' />
        </span>
      </NavLink>
      {!focusComponent && (
        <div className='flex gap-8 px-6 h-6 @container/navigation relative flex-1'>
          {menu.map((item, index) =>
            item.submenu ? (
              <NavMenu key={index} item={item} index={index} />
            ) : (
              <NavLink
                key={index}
                item={item}
                className={`@nav-${index}/navigation:inline-block hidden whitespace-nowrap`}
              >
                {item.label}
              </NavLink>
            ),
          )}
          <div className={`@nav-${menu.length - 1}/navigation:hidden flex items-center relative`}>
            <Button
              leftIcon={<ChevronDown className='w-3' />}
              color='quaternary'
              variant='transparent'
              onClick={() => setShowMenu(!showMenu)}
              text='More'
              className='!text-base !p-0 !min-h-0'
            />
            {showMenu && (
              <>
                <div className='absolute left-0 top-[calc(100%+4px)] z-50'>
                  <ul
                    className={classNames(
                      'py-4 list-none flex flex-wrap gap-2 bg-white/10 backdrop-blur-lg',
                      'relative isolate max-w-full overflow-hidden rounded-sm',
                      'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-sm before:p-[1px] before:border-glas',
                    )}
                  >
                    {menu.map((item, index) => (
                      <li
                        className={`@nav-${index}/navigation:hidden block w-full m-0`}
                        key={index}
                      >
                        <NavLink
                          item={item}
                          onClick={() => setShowMenu(false)}
                          className='w-full px-4 whitespace-nowrap'
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className='fixed -top-6 -left-[55px] z-40 w-screen h-screen hover:cursor-pointer'
                  onClick={() => setShowMenu(false)}
                  role='button'
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
