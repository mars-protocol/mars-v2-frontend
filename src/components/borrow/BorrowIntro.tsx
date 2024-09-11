import Intro from '../common/Intro'

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
    ></Intro>
  )
}
