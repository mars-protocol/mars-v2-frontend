import ActionButton from 'components/common/Button/ActionButton'
import { ArrowUpLine } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import useStore from 'store'

export default function LendIntro() {
  return (
    <Intro
      text={
        <>
          By <span className='text-white'>Lending</span> your assets, you&apos;ll earn attractive
          interest (APY) without impacting your loan to value (LTV). It&apos;s a win-win situation -
          don&apos;t miss out on this easy opportunity to grow your holdings!
        </>
      }
      bg='lend'
    >
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
