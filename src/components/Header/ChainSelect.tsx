import { useCallback, useEffect } from 'react'
import { useSWRConfig } from 'swr'

import Button from 'components/Button'
import { Osmo } from 'components/Icons'
import Overlay from 'components/Overlay'
import chains from 'configs/chains'
import useChainConfig from 'hooks/useChainConfig'
import useToggle from 'hooks/useToggle'
import useStore from 'store'

export default function ChainSelect() {
  const [showMenu, setShowMenu] = useToggle()
  const chainConfig = useChainConfig()
  const { mutate } = useSWRConfig()

  const selectChain = useCallback(async (chainConfig: ChainConfig) => {
    useStore.setState({ chainConfig: chainConfig })
  }, [])

  useEffect(() => {
    mutate((key) => true)
  }, [chainConfig, mutate])

  return (
    <div>
      <Button
        variant='round'
        color='tertiary'
        onClick={() => setShowMenu()}
        className='!p-1.5 flex items-center justify-center'
      >
        <Osmo />
      </Button>
      <Overlay show={showMenu} setShow={setShowMenu}>
        {Object.entries(chains).map(([name, chainConfig]) => (
          <Button key={name} onClick={() => selectChain(chainConfig)}>
            {name}
          </Button>
        ))}
      </Overlay>
    </div>
  )
}
