import { useParams } from 'react-router-dom'

import Intro from 'components/Intro'
import useStore from 'store'

export default function PortfolioIntro() {
  const { address } = useParams()
  const walletAddress = useStore((s) => s.address)

  return (
    <Intro
      text={
        address && !walletAddress ? (
          <>
            This is the <span className='text-white'>Portfolio</span> of the address{' '}
            <span className='text-white'>{address}</span>. You can see all Credit Accounts of this
            address, but you can&apos;t interact with them.
          </>
        ) : (
          <>
            This is your <span className='text-white'>Portfolio</span>. Use it to get an overview
            about all your Credit Accounts and their balances.
          </>
        )
      }
      bg='portfolio'
    ></Intro>
  )
}
