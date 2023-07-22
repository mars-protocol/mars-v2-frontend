import classNames from 'classnames'
import { useCallback } from 'react'

import { Check } from 'components/Icons'
import Text from 'components/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import { TERMS_OF_SERVICE_KEY } from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'

import FocusComponent from './FocusedComponent'

interface BenefitsProps {
  benefits: string[]
}

function Benefits({ benefits }: BenefitsProps) {
  return (
    <ul className='w-full list-none px-0'>
      {benefits.map((benefit, index) => (
        <li className='relative mb-6 flex h-6 w-full items-center px-0 pl-8' key={index}>
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
  const [_, setHasAgreedToTerms] = useLocalStorage(TERMS_OF_SERVICE_KEY, false)

  const handleAgreeTermsOfService = useCallback(() => {
    setHasAgreedToTerms(true)
    useStore.setState({ focusComponent: <WalletSelect /> })
  }, [setHasAgreedToTerms])

  return (
    <FocusComponent
      title='Master the Red Planet'
      copy='Mars offers the easiest way to margin trade, lend & borrow and yield farm with leverage any whitelisted token'
      button={{
        className: 'w-full mt-4',
        text: 'Agree & continue',
        color: 'tertiary',
        onClick: handleAgreeTermsOfService,
        size: 'lg',
      }}
      docs='terms'
    >
      <Benefits
        benefits={[
          'Swap tokens with margin acress any whitelisted pair',
          'Amplify your LP rewards with leveraged yield farming',
          'Earn interest on deposited tokens',
        ]}
      />
    </FocusComponent>
  )
}
