import Card from 'components/common/Card'
import classNames from 'classnames'
import NavigateBackButton from 'components/managedVaults/NavigateBackButton'
import Text from 'components/common/Text'
import useStore from 'store'

interface Props {
  children: React.ReactNode
  cardClassName?: string
}

export default function CreateVaultContent(props: Props) {
  const { children, cardClassName } = props
  const address = useStore((s) => s.address)

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='flex items-center mb-6'>
        <NavigateBackButton />
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
        {address ? (
          children
        ) : (
          <div className='flex items-center justify-center h-118'>
            <Text size='sm' className='w-full text-center'>
              You need to be connected to view this page.
            </Text>
          </div>
        )}
      </Card>
    </div>
  )
}
