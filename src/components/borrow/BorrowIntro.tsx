import Button from 'components/common/Button'
import { PlusSquared } from 'components/common/Icons'
import Intro from 'components/common/Intro'
import { DocURL } from 'types/enums'
export default function BorrowIntro() {
  return (
    <Intro
      text={
        <>
          <span className='text-white'>Borrow</span> assets, against your collateral. But always
          have an eye on your Health. Once it reaches zero, you&apos;ll be liquidated.
        </>
      }
      bg='borrow'
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
    </Intro>
  )
}
