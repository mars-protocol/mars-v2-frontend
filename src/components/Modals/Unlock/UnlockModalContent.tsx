import { hardcodedFee } from 'utils/constants'
import Button from 'components/Button'
import { Enter } from 'components/Icons'
import Text from 'components/Text'
import useStore from 'store'

interface Props {
  depositedVault: DepositedVault
  onClose: () => void
}

function NoIcon() {
  return (
    <div className='ml-1 flex items-center rounded-xs border-[1px] border-white/5 bg-white/5 px-1 py-0.5 text-[8px] font-bold leading-[10px] text-white/60 '>
      ESC
    </div>
  )
}

function YesIcon() {
  return (
    <div className='ml-1 rounded-xs border-[1px] border-white/5 bg-white/5 px-1 py-0.5'>
      <Enter width={12} />
    </div>
  )
}

export default function UnlockModalContent(props: Props) {
  const unlock = useStore((s) => s.unlock)

  async function onConfirm() {
    await unlock({
      fee: hardcodedFee,
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
      <div className='mt-10 flex flex-row-reverse justify-between'>
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
