import Button from 'components/common/Button'
import ActionButton from 'components/common/Button/ActionButton'
import { ArrowUpLine, PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import useStore from 'store'
import { DocURL } from 'types/enums'

export default function BankIntro() {
  return (
    <Intro
      text={
        <>
          <span className='text-white'>Lend</span> your assets to earn attractive interest (APY)
          without impacting your loan to value (LTV), or <span className='text-white'>borrow</span>{' '}
          assets against your collateral. But always have an eye on your Health. Once it reaches
          zero, you&apos;ll be liquidated.
        </>
      }
      bg='lend'
    >
      <Button
        text='Learn more'
        leftIcon={<PlusSquared />}
        onClick={(e) => {
          e.preventDefault()
          window.open(DocURL.BORROW_LENDING_URL, '_blank')
        }}
        color='secondary'
      />
      <ActionButton
        text='Deposit assets'
        color='secondary'
        leftIcon={<ArrowUpLine />}
        onClick={() => {
          useStore.setState({ fundAndWithdrawModal: 'fund' })
        }}
      />
    </Intro>
  )
}
