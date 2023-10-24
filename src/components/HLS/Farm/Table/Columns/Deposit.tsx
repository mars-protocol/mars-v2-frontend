import classNames from 'classnames'
import { useCallback } from 'react'

import ActionButton from 'components/Button/ActionButton'
import { Enter } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useAlertDialog from 'hooks/useAlertDialog'
import useLocalStorage from 'hooks/useLocalStorage'

export const DEPOSIT_META = { accessorKey: 'deposit', header: 'Deposit' }

interface Props {
  vault: Vault
  isLoading: boolean
}

export default function Deposit(props: Props) {
  const { vault } = props

  const [showHlsInfo, setShowHlsInfo] = useLocalStorage<boolean>(
    LocalStorageKeys.HLS_INFORMATION,
    true,
  )

  const { open: openAlertDialog, close } = useAlertDialog()

  const showHlsInfoModal = useCallback(() => {
    if (!showHlsInfo) return
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
        onClick: enterVaultHandler,
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
  }, [close, enterVaultHandler, openAlertDialog, setShowHlsInfo, showHlsInfo])

  function enterVaultHandler() {
    showHlsInfoModal()
    return
  }

  if (props.isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      <ActionButton onClick={enterVaultHandler} color='tertiary' text='Deposit' />
    </div>
  )
}

const INFO_ITEMS = [
  {
    icon: <Enter width={16} height={16} />,
    title: 'One account, one position',
    description:
      'A minted HLS account can only have a single position tied to it, in order to limit risk.',
  },
  {
    icon: <Enter />,
    title: 'Funded from your wallet',
    description: 'To fund your HLS position, funds will have to come directly from your wallet.',
  },
  {
    icon: <Enter />,
    title: 'Accounts are reusable',
    description:
      'If you exited a position from a minted account, this account can be reused for a new position.',
  },
]
