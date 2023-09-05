import Intro from 'components/Intro'

export default function PortfolioIntro() {
  return (
    <Intro
      text={
        <>
          This is your <span className='text-white'>Portfolio</span>. Use it to get an overview
          about all your Credit Accounts and their balances.
        </>
      }
    ></Intro>
  )
}
