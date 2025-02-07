import Card from 'components/common/Card'
import classNames from 'classnames'
import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import Text from 'components/common/Text'

interface Props {
  children: React.ReactNode
  cardClassName?: string
}

export default function CreateVaultContent(props: Props) {
  const { children, cardClassName } = props

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='flex items-center mb-6'>
        <NavigationBackButton />
      </div>

      <div className='flex flex-col items-center mb-8'>
        <Text size='4xl' className='w-full pb-2 text-center'>
          Create Vault
        </Text>
        <Text size='sm' className='w-full text-center text-white/60'>
          We'll require you to authorise a transaction in your wallet in order to begin.
        </Text>
      </div>

      <Card className={classNames('p-4 md:p-6 bg-white/5 w-full', cardClassName)} showOverflow>
        {children}
      </Card>
    </div>
  )
}
