import { useWalletManager } from '@marsprotocol/wallet-connector'
import classNames from 'classnames'
import { useCallback } from 'react'

import Text from 'components/Text'
import { TERMS_OF_SERVICE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import Button from 'components/Button'
import { Check, ExternalLink } from 'components/Icons'

interface BenefitsProps {
  benefits: string[]
}

function Benefits({ benefits }: BenefitsProps) {
  return (
    <ul className='w-full px-0 py-3 list-none'>
      {benefits.map((benefit, index) => (
        <li className='relative flex items-center w-full h-6 px-0 pl-8 my-6' key={index}>
          <div
            className={classNames(
              'absolute left-0 top-0 isolate h-6 w-6 rounded-full bg-white/10',
              'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-full before:p-[1px] before:border-glas',
            )}
          >
            <Check className='p-1.5' />
          </div>
          <Text size='sm' className=' text-white/60'>
            {benefit}
          </Text>
        </li>
      ))}
    </ul>
  )
}

export default function TermsOfService() {
  const { connect } = useWalletManager()
  const [_, setHasAgreedToTerms] = useLocalStorage(TERMS_OF_SERVICE_KEY, false)

  const handleAgreeTermsOfService = useCallback(() => {
    useStore.setState({focusMode: null })
    setHasAgreedToTerms(true)
    connect()
  }, [connect, setHasAgreedToTerms])

  return (
    <div className='relative flex items-center justify-center w-full h-full'>
      <div className='w-100'>
        <Text size='4xl' className='w-full pb-2'>
          Master the Red Planet
        </Text>
        <Text size='sm' className='w-full text-white/60'>
          Mars offers the easiest way to margin trade, lend & borrow and yield farm with leverage
          any whitelisted token
        </Text>
        <Benefits
          benefits={[
            'Swap tokens with margin acress any whitelisted pair',
            'Amplify your LP rewards with leveraged yield farming',
            'Earn interest on deposited tokens',
          ]}
        />
        <Button
          className='w-full'
          text='Agree & continue'
          color='tertiary'
          onClick={handleAgreeTermsOfService}
          size='lg'
        />
        <Text size='sm' className='w-full pt-5 text-center text-white/60'>
          By continuing you accept our{' '}
          <a
            href='https://docs.marsprotocol.io/docs/overview/legal/terms-of-service'
            target='_blank'
            className='leading-4 text-white hover:underline'
          >
            terms of service
            <ExternalLink className='-mt-1 ml-1 inline w-3.5' />
          </a>
        </Text>
      </div>
    </div>
  )
}
