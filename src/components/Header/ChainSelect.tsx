import classNames from 'classnames'
import { useCallback, useEffect } from 'react'
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

export default function ChainSelect() {
  const [showMenu, setShowMenu] = useToggle()
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()
  const [currentChainId, setCurrentChainId] = useCurrentChainId()

  const selectChain = useCallback(async (chainConfig: ChainConfig) => {
    useStore.setState({ chainConfig: chainConfig })
    setCurrentChainId(chainConfig.id)
  }, [])

  useEffect(() => {
    mutate((key) => true)
  }, [chainConfig, mutate])

  return (
    <div className='relative'>
      <Button
        leftIcon={<ChainLogo chainID={chainConfig.id} className='w-4' />}
        iconClassName='w-5 h-5'
        color='tertiary'
        onClick={() => setShowMenu()}
        className='!p-0 w-8 flex items-center justify-center'
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
          {Object.entries(chains).map(([name, chain]) => (
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
