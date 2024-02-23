import classNames from 'classnames'
import React, { useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSWRConfig } from 'swr'

import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Radio from 'components/common/Radio'
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

interface V1Outpost {
  chainId: ChainInfoID
  name: string
  url: string
  network: NETWORK.MAINNET | NETWORK.TESTNET
  target: '_blank' | '_self'
}

interface ChainOptionProps {
  chainConfig?: ChainConfig
  onSelect?: (chain: ChainConfig) => void
  active: boolean
  outpost?: V1Outpost
}

const v1Outposts: V1Outpost[] = [
  {
    chainId: ChainInfoID.Neutron1,
    name: 'Neutron',
    url: 'https://neutron.marsprotocol.io',
    network: NETWORK.MAINNET,
    target: '_blank',
  },
  {
    chainId: ChainInfoID.Pion1,
    name: 'Neutron Testnet',
    url: '/v1',
    network: NETWORK.TESTNET,
    target: '_self',
  },
  {
    chainId: ChainInfoID.Osmosis1,
    name: 'Osmosis',
    url: '/v1',
    network: NETWORK.MAINNET,
    target: '_self',
  },
  {
    chainId: ChainInfoID.OsmosisDevnet,
    name: 'Osmosis Devnet',
    network: NETWORK.TESTNET,
    url: '/v1',
    target: '_self',
  },
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

  const ChainOption = (props: ChainOptionProps) => {
    const { onSelect, active, outpost, chainConfig } = props
    return (
      <div
        className={classNames(
          'w-full px-4 py-3 flex gap-3 group/chain text-white items-center',
          active ? 'pointer-events-none' : 'opacity-60 hover:opacity-100',
        )}
        role='button'
        onClick={
          onSelect && chainConfig
            ? () => onSelect(chainConfig)
            : () => {
                if (chainConfig) {
                  setCurrentChainId(chainConfig.id)
                  useStore.setState({
                    chainConfig,
                  })
                }
                window.open(outpost?.url, outpost?.target)
              }
        }
      >
        <Radio active={active} className='group-hover/account:opacity-100' />
        <Text size='sm'>{outpost ? 'v1' : 'v2'} Outpost</Text>
        {outpost && outpost.target !== '_self' && <ExternalLink className='inline w-4 -mb-0.5' />}
      </div>
    )
  }

  const availableChains = useMemo(() => {
    const currentNetworkType = process.env.NEXT_PUBLIC_NETWORK ?? NETWORK.TESTNET
    const availableChains: { chainId: ChainInfoID; name: string }[] = []
    Object.entries(chains).forEach(([chainId, chainConfig]) => {
      if (chainConfig.network !== currentNetworkType) return
      availableChains.push({ chainId: chainId as ChainInfoID, name: chainConfig.name })
    })
    if (currentNetworkType === NETWORK.TESTNET) return availableChains

    v1Outposts.forEach((v1Outpost) => {
      if (
        !availableChains.find((chain) => chain.chainId === v1Outpost.chainId) &&
        v1Outpost.network === currentNetworkType
      )
        availableChains.push({ chainId: v1Outpost.chainId, name: v1Outpost.name })
    })

    return availableChains
  }, [])

  return (
    <div className='relative'>
      <Button
        leftIcon={<ChainLogo chainID={chainConfig.id} className='w-4' />}
        iconClassName='w-5 h-5'
        color='secondary'
        onClick={() => setShowMenu()}
        className={classNames('!p-0 w-8 flex items-center justify-center')}
      />
      <Overlay
        show={showMenu}
        setShow={setShowMenu}
        className='right-0 w-[200px] mt-2 overflow-hidden'
      >
        {availableChains.map((chain, index) => (
          <React.Fragment key={chain.chainId}>
            <div
              className={classNames(
                'flex items-center gap-2 px-4 py-3 border-b bg-white/10 border-white/20',
                index > 0 && 'border-t',
              )}
            >
              <ChainLogo chainID={chain.chainId} className='w-5' />
              <Text>{chain.name}</Text>
            </div>
            {!!chains[chain.chainId] && (
              <ChainOption
                chainConfig={chains[chain.chainId]}
                onSelect={() => selectChain(chains[chain.chainId])}
                active={chainConfig.name === chain.name && !isV1}
              />
            )}
            <ChainOption
              chainConfig={chains[chain.chainId]}
              outpost={v1Outposts.find((outpost) => outpost.chainId === chain.chainId)}
              active={chainConfig.name === chain.name && isV1}
            />
          </React.Fragment>
        ))}
      </Overlay>
    </div>
  )
}
