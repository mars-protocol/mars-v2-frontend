import { NoIcon, YesIcon } from 'components/Modals/AlertDialog/ButtonIcons'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import useAccountId from 'hooks/accounts/useAccountId'
import useStore from 'store'

interface Props {
  depositedVault: DepositedVault
  onClose: () => void
}

export default function UnlockModalContent(props: Props) {
  const unlock = useStore((s) => s.unlock)
  const accountId = useAccountId()

  function onConfirm() {
    if (!accountId) return
    unlock({
      accountId: accountId,
      vault: props.depositedVault,
      amount: props.depositedVault.amounts.locked.toString(),
    })
    props.onClose()
  }

  return (
    <>
      <Text size='xl'>Are you sure you would like to unlock this position?</Text>
      <Text className='mt-2 text-white/60'>
        {`Are you sure you want to unlock this position? The unlocking period will take ${props.depositedVault.lockup.duration} ${props.depositedVault.lockup.timeframe}.`}
      </Text>
      <div className='flex flex-row-reverse justify-between mt-10'>
        <Button
          text='Yes'
          color='tertiary'
          className='px-6'
          rightIcon={<YesIcon />}
          onClick={onConfirm}
        />
        <Button
          text='No'
          color='secondary'
          className='px-6'
          rightIcon={<NoIcon />}
          tabIndex={1}
          onClick={props.onClose}
        />
      </div>
    </>
  )
}
