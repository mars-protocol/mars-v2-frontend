import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import ActionButton from 'components/common/Button/ActionButton'
import Text from 'components/common/Text'
import WarningMessages from 'components/common/WarningMessages'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'

export default function ExecuteMessagePage() {
  const [searchParams] = useSearchParams()
  const chainConfig = useChainConfig()

  const [contract, setContract] = useState<string>(
    searchParams.get('contract') ?? chainConfig.contracts.creditManager,
  )
  const [message, setMessage] = useState<string>(atob(searchParams.get('msg') ?? ''))
  const [funds, setFunds] = useState<string>(atob(searchParams.get('funds') ?? ''))

  const [messageWarnings, setMessageWarnings] = useState<string[]>([])
  const [fundsWarnings, setFundsWarnings] = useState<string[]>([])

  const execute = useStore((s) => s.execute)

  function onChangeTextArea(value: string) {
    setMessage(value)

    try {
      if (value !== '') JSON.parse(value)
      setMessageWarnings([])
    } catch {
      setMessageWarnings(['Invalid JSON'])
    }
  }

  function onChangeFunds(value: string) {
    setFunds(value)

    try {
      if (value !== '') JSON.parse(value)
      setFundsWarnings([])
    } catch {
      setFundsWarnings(['Invalid JSON'])
    }
  }

  return (
    <div className='w-full flex flex-col gap-4'>
      <Text>Execute Custom Message</Text>
      <label>
        <Text className='text-white/60 mb-1 text-xs'>Contract address</Text>
        <input
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          className='bg-surface p-4 w-full text-sm'
        />
      </label>

      <label>
        <div className='flex items-center h-6 gap-2'>
          <Text className='text-white/60 mb-1 text-xs'>Message</Text>
          <WarningMessages messages={messageWarnings} />
        </div>

        <textarea
          value={message}
          onChange={(e) => onChangeTextArea(e.target.value)}
          className='text-white h-90 bg-surface p-4 w-full text-sm'
        />
      </label>
      <label>
        <div className='flex items-center h-6 gap-2'>
          <Text className='text-white/60 mb-1 text-xs'>Funds</Text>
          <WarningMessages messages={fundsWarnings} />
        </div>

        <textarea
          value={funds}
          onChange={(e) => onChangeFunds(e.target.value)}
          className='text-white h-40 bg-surface p-4 w-full text-sm'
        />
      </label>

      <ActionButton
        text='Execute'
        onClick={() => {
          execute(contract, JSON.parse(message), funds ? JSON.parse(funds) : [])
        }}
        disabled={fundsWarnings.length > 0 || !contract || messageWarnings.length > 0 || !message}
      />
    </div>
  )
}
