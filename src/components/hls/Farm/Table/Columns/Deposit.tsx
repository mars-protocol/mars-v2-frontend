import classNames from 'classnames'
import { useCallback } from 'react'

import Button from 'components/common/Button'
import { Circle, Enter, TrashBin, Wallet } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useAlertDialog from 'hooks/useAlertDialog'
import useStore from 'store'

export const DEPOSIT_META = { accessorKey: 'deposit', header: 'Deposit' }

interface Props {
  isLoading: boolean
  strategy?: HLSStrategy
  vault?: Vault
}

export default function Deposit(props: Props) {
  const { strategy, vault } = props

  const [showHlsInfo, setShowHlsInfo] = useLocalStorage<boolean>(
    LocalStorageKeys.HLS_INFORMATION,
    true,
  )

  const { open: openAlertDialog, close } = useAlertDialog()

  const openHlsModal = useCallback(
    () => useStore.setState({ hlsModal: { strategy, vault } }),
    [strategy, vault],
  )

  const handleOnClick = useCallback(() => {
    if (!showHlsInfo) {
      openHlsModal()
      return
    }

    openAlertDialog({
      title: 'Understanding HLS Positions',
      content: (
        <div className='flex flex-col gap-8 pt-2 pb-8 pr-10'>
          {INFO_ITEMS.map((item) => (
            <div key={item.title} className='grid grid-cols-[min-content,auto]'>
              <span
                className={classNames(
                  'rounded-sm relative h-10 w-10 p-3 bg-white/10 mr-6 grid place-items-center',
                  'before:content-[" "] before:absolute before:inset-0 before:rounded-sm before:p-[1px] before:border-glas before:-z-1',
                )}
              >
                {item.icon}
              </span>
              <span className='flex flex-col'>
                <Text>{item.title}</Text>
                <Text className='text-sm text-white/60'>{item.description}</Text>
              </span>
            </div>
          ))}
        </div>
      ),
      positiveButton: {
        text: 'Continue',
        icon: <Enter />,
        onClick: openHlsModal,
      },
      negativeButton: {
        text: 'Cancel',
        onClick: () => {
          setShowHlsInfo(true)
          close()
        },
      },
      checkbox: {
        text: "Don't show again",
        onClick: (isChecked: boolean) => setShowHlsInfo(!isChecked),
      },
    })
  }, [close, openAlertDialog, openHlsModal, setShowHlsInfo, showHlsInfo])

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <Button onClick={handleOnClick} color='tertiary' text='Deposit' />
    </div>
  )
}

const INFO_ITEMS = [
  {
    icon: <Circle />,
    title: 'One account, one position',
    description:
      'A minted HLS account can only have a single position tied to it, in order to limit risk.',
  },
  {
    icon: <Wallet />,
    title: 'Funded from your wallet',
    description: 'To fund your HLS position, funds will have to come directly from your wallet.',
  },
  {
    icon: <TrashBin />,
    title: 'Accounts are reusable',
    description:
      'If you exited a position from a minted account, this account can be reused for a new position.',
  },
]
