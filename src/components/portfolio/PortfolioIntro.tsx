import { useParams } from 'react-router-dom'

import useStore from '../../store'
import Intro from '../common/Intro'

export default function PortfolioIntro() {
  const { address: urlAddress } = useParams()
  const address = useStore((s) => s.address)
  const isCurrentWalllet = !urlAddress || urlAddress === address

  return (
    <Intro
      text={
        !isCurrentWalllet ? (
          <>
            This is the <span className='text-white'>Portfolio</span> of the address{' '}
            <span className='text-white'>{urlAddress}</span>. You can see all Credit Accounts of
            this address, but you can&apos;t interact with them.
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
