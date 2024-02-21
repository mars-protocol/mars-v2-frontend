import classNames from 'classnames'
import { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'

import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import ChainLogo from 'components/common/chain/ChainLogo'
import chains from 'configs/chains'
import useCurrentChainId from 'hooks/localStorage/useCurrentChainId'
import useChainConfig from 'hooks/useChainConfig'
import useToggle from 'hooks/useToggle'
import useStore from 'store'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'
import { getRoute } from 'utils/route'

const v1Outposts = [
  {
    chainId: ChainInfoID.Neutron1,
    name: 'Neutron',
    url: 'https://neutron.marsprotocol.io',
    target: '_blank',
  },
  { chainId: ChainInfoID.Osmosis1, name: 'Osmosis', url: '/v1', target: '_self' },
]

export default function ChainSelect() {
  const [showMenu, setShowMenu] = useToggle()
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isV1 = useStore((s) => s.isV1)

  const [_, setCurrentChainId] = useCurrentChainId()

  const selectChain = useCallback(
    async (chainConfig: ChainConfig) => {
      setShowMenu(false)
      setCurrentChainId(chainConfig.id)
      mutate(() => true)
      useStore.setState({
        chainConfig,
        isV1: false,
        client: undefined,
        address: undefined,
        userDomain: undefined,
        balances: [],
      })
      navigate(getRoute('trade', searchParams))
    },
    [setCurrentChainId, setShowMenu, mutate, navigate, searchParams],
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
        color='secondary'
        onClick={() => setShowMenu()}
        className={classNames('!p-0 w-8 flex items-center justify-center')}
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
                'w-full py-2 flex gap-3 group/chain text-white items-center',
                chainConfig.name === chain.name && !isV1
                  ? 'pointer-events-none'
                  : 'opacity-60 hover:opacity-100',
              )}
              role='button'
              key={name}
              onClick={() => selectChain(chain)}
            >
              <ChainLogo chainID={chain.id} className='w-6' />
              <Text size='sm'>{chain.name}</Text>
            </li>
          ))}
        </ul>
        {process.env.NEXT_PUBLIC_NETWORK === NETWORK.MAINNET && (
          <>
            <div
              className={classNames(
                'flex w-full items-center bg-white/5 px-4 py-3',
                'border border-transparent border-y-white/10',
              )}
            >
              <Text size='lg' className='font-bold'>
                V1 Outposts
              </Text>
            </div>
            <ul className='w-full px-4 py-3 list-none'>
              {v1Outposts.map((outpost) => (
                <li
                  className={classNames(
                    'w-full py-2 flex gap-3 group/chain text-white items-center',
                    chainConfig.name === outpost.name && isV1
                      ? 'pointer-events-none'
                      : 'opacity-60 hover:opacity-100',
                  )}
                  role='button'
                  onClick={() => window.open(outpost.url, outpost.target)}
                  key={outpost.name}
                >
                  <ChainLogo chainID={outpost.chainId} className='w-6' />
                  <Text size='sm'>
                    {outpost.name}{' '}
                    {outpost.target !== '_self' && (
                      <ExternalLink className='w-4 ml-1 mb-0.5 inline' />
                    )}
                  </Text>
                </li>
              ))}
            </ul>
          </>
        )}
      </Overlay>
    </div>
  )
}
