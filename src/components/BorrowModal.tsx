import useStore from 'store'

import { Modal } from './Modal'
import TitleAndSubCell from './TitleAndSubCell'

export default function BorrowModal() {
  const open = useStore((s) => s.borrowModal)

  function setOpen(isOpen: boolean) {
    useStore.setState({ borrowModal: isOpen })
  }

  return (
    <Modal open={open} setOpen={setOpen} title='Borrow OSMO'>
      <div className='flex gap-3'>
        <TitleAndSubCell title='10.00%' sub={'Borrow rate'} />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell title='$200' sub={'Borrowed'} />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell title='10.5M ($105M)' sub={'Liquidity available'} />
      </div>
      <div className='flex'></div>
    </Modal>
  )
}
