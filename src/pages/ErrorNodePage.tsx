import { useShuttle } from '@delphi-labs/shuttle-react'
import Background from 'components/common/Background'
import Button from 'components/common/Button'
import { ExternalLink } from 'components/common/Icons'
import Text from 'components/common/Text'
import TextInput from 'components/common/TextInput'
import { TextLink } from 'components/common/TextLink'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useChainConfig from 'hooks/chain/useChainConfig'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { useCallback, useMemo, useState } from 'react'
import useStore from 'store'
import { getCurrentChainId } from 'utils/getCurrentChainId'

export default function ErrorNodePage() {
  const chainConfig = useChainConfig()
  const [clicked, setClicked] = useState(false)
  const chainId = getCurrentChainId()
  const nodeError = useStore((s) => s.errorStore).nodeError
  const [tempRpcEndpoint, setTempRpcEndpoint] = useState('')
  const { disconnectWallet } = useShuttle()
  const currentWallet = useCurrentWallet()
  const [validRpc, setValidRpc] = useState(true)
  const [rpcEndpoint, setRpcEndpoint] = useLocalStorage<string>(
    `${chainConfig.id}/${LocalStorageKeys.RPC_ENDPOINT}`,
    chainConfig.endpoints.rpc,
  )
  const validateRpcEndpoint = useCallback(
    async (value: string) => {
      try {
        const url = new URL(value)
        const isValidEndpoint = await fetch(`${url.href}status?`, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(async (res) => {
          const json = await res.json()
          return json?.result?.node_info?.network === chainId
        })
        if (isValidEndpoint) {
          setValidRpc(true)
          setRpcEndpoint(value)
        }
      } catch (error) {
        setValidRpc(false)
      }
    },
    [setValidRpc, chainId, setRpcEndpoint],
  )

  const onSetFallback = useCallback(() => {
    setClicked(true)
    if (rpcEndpoint === chainConfig.endpoints.fallbackRpc) {
      setValidRpc(true)
      setRpcEndpoint(chainConfig.endpoints.rpc)
      setTempRpcEndpoint('')
    } else {
      setRpcEndpoint(chainConfig.endpoints.fallbackRpc)
      setTempRpcEndpoint('')
    }
    if (currentWallet) disconnectWallet(currentWallet)
    refresh()
  }, [
    rpcEndpoint,
    chainConfig.endpoints.fallbackRpc,
    chainConfig.endpoints.rpc,
    currentWallet,
    disconnectWallet,
    setRpcEndpoint,
  ])

  const refresh = () => {
    setClicked(true)
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    }
  }

  const inputValue = useMemo(
    () => (tempRpcEndpoint.trim().length === 0 ? rpcEndpoint : tempRpcEndpoint),
    [tempRpcEndpoint, rpcEndpoint],
  )

  if (!nodeError) return null

  return (
    <>
      <Background />
      <main className='relative z-20 w-full'>
        <div className='flex flex-wrap justify-center w-full gap-6 p-20'>
          <Text size='4xl' className='w-full text-center'>
            A node encountered an issue!
          </Text>

          <Text size='sm' className='w-full leading-4 text-center text-white'>
            A node used by the app had an issue:{' '}
            <TextLink
              href={nodeError.api}
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='Node Endpoint'
            >
              {nodeError.api}
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>
          </Text>
          <Text size='sm' className='w-full italic leading-4 text-center text-martian-red'>
            Reason: {nodeError.message}
          </Text>
          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            Node data is mandatory for the app to work. You can switch to a fallback node to
            overcome this issue or set your own nodes in the inputs below.
          </Text>
          <div className='flex flex-wrap items-stretch w-full max-w-[600px] gap-4 justify-center'>
            <TextInput
              label='RPC'
              placeholder='https://'
              value={inputValue}
              onChange={(value) => {
                setTempRpcEndpoint(value)
                validateRpcEndpoint(value)
              }}
              error={!validRpc}
              errorMessage={`Invalid ${chainId} RPC Endpoint. Failed to fetch the /status? API.`}
              className='w-full'
            />
            <Button
              onClick={() => onSetFallback()}
              className='min-w-[150px]'
              text='Switch to fallback node'
              color='secondary'
              showProgressIndicator={clicked}
            />
            <Button
              onClick={() => refresh()}
              className='min-w-[150px]'
              text='Save & Reload'
              color='primary'
              disabled={!validRpc}
              showProgressIndicator={clicked}
            />
          </div>
          <Text size='sm' className='w-full leading-4 text-center text-white/70'>
            If this doesn't solve your problem, please contact a moderator on{' '}
            <TextLink
              href='https://discord.marsprotocol.io'
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='Mars Protocol Discord'
            >
              Discord
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>{' '}
            or{' '}
            <TextLink
              href='https://telegram.marsprotocol.io'
              target='_blank'
              className='leading-4 text-white hover:underline'
              title='Mars Protocol Telegram'
            >
              Telegram
              <ExternalLink className='ml-1 inline w-3.5' />
            </TextLink>
          </Text>
        </div>
      </main>
    </>
  )
}
