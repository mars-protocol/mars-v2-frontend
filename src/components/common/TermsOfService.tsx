import classNames from 'classnames'
import { useCallback } from 'react'

import FullOverlayContent from 'components/common/FullOverlayContent'
import { Check } from 'components/common/Icons'
import Text from 'components/common/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import { LocalStorageKeys } from 'constants/localStorageKeys'
import useLocalStorage from 'hooks/localStorage/useLocalStorage'
import useStore from 'store'

interface BenefitsProps {
  benefits: string[]
}

function Benefits({ benefits }: BenefitsProps) {
  return (
    <ul className='w-full px-0 list-none'>
      {benefits.map((benefit, index) => (
        <li className='relative flex items-center w-full h-6 px-0 pl-8 mb-6' key={index}>
          <div className={classNames('absolute left-0 top-0 isolate h-6 w-6 rounded-full ')}>
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
  const [_, setHasAgreedToTerms] = useLocalStorage(LocalStorageKeys.TERMS_OF_SERVICE, false)

  const handleAgreeTermsOfService = useCallback(() => {
    setHasAgreedToTerms(true)
    useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [setHasAgreedToTerms])

  return (
    <FullOverlayContent
      title='Master the Red Planet'
      copy='Mars offers the easiest way to margin trade, lend, borrow and yield farm with leverage any whitelisted token'
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
          'Swap tokens with margin across any whitelisted pair',
          'Amplify your LP rewards with leveraged yield farming',
          'Earn interest on deposited tokens',
        ]}
      />
    </FullOverlayContent>
  )
}
