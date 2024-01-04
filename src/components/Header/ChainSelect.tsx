import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'

import Button from 'components/Button'
import ChainLogo from 'components/Chain/ChainLogo'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import chains from 'configs/chains'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useChainConfig from 'hooks/useChainConfig'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { NETWORK } from 'types/enums/network'
import { getPage, getRoute } from 'utils/route'

export default function ChainSelect() {
  const [showMenu, setShowMenu] = useToggle()
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()

  const [_, setCurrentChainId] = useCurrentChainId()

  const selectChain = useCallback(
    async (chainConfig: ChainConfig) => {
      setShowMenu(false)
      setCurrentChainId(chainConfig.id)
      mutate(() => true)
      useStore.setState({
        chainConfig,
        client: undefined,
        address: undefined,
        userDomain: undefined,
        accounts: null,
        balances: [],
      })
      navigate(getRoute(getPage(pathname), searchParams))
    },
    [setCurrentChainId, setShowMenu, mutate, navigate, pathname, searchParams],
  )

  const currentChains = useMemo(() => {
    const currentNetworkType = process.env.NEXT_PUBLIC_NETWORK ?? NETWORK.TESTNET

    return Object.entries(chains).filter(([_, chain]) => chain.network === currentNetworkType)
  }, [])

  return (
    <div className='relative'>
      <Button
        leftIcon={<ChainLogo chainID={chainConfig.id} className='w-4' />}
        iconClassName='w-5 h-5'
        color='tertiary'
        onClick={currentChains.length > 1 ? () => setShowMenu() : undefined}
        className={classNames(
          '!p-0 w-8 flex items-center justify-center',
          currentChains.length === 1 && 'pointer-events-none',
        )}
      ></Button>
      <Overlay show={showMenu} setShow={setShowMenu} className='right-0 w-[180px] mt-2'>
        <div
          className={classNames(
            'flex w-full items-center bg-white/5 px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            Select Chain
          </Text>
        </div>
        <ul className='w-full px-4 py-3 list-none'>
          {currentChains.map(([name, chain]) => (
            <li
              className={classNames(
                'w-full py-2 flex gap-3 group/chain text-white',
                chainConfig.name === chain.name
                  ? 'pointer-events-none'
                  : 'opacity-60 hover:opacity-100',
              )}
              role='button'
              key={name}
              onClick={() => selectChain(chain)}
            >
              <ChainLogo chainID={chain.id} className={classNames('w-5')} />
              <Text size='sm'>{chain.name}</Text>
            </li>
          ))}
        </ul>
      </Overlay>
    </div>
  )
}
