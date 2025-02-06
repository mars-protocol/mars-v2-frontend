import classNames from 'classnames'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import { ChevronLeft } from 'components/common/Icons'
import Text from 'components/common/Text'
import { useNavigate } from 'react-router-dom'

interface Props {
  children: React.ReactNode
  cardClassName?: string
}

export default function CreateVaultContent(props: Props) {
  const { children, cardClassName } = props
  const navigate = useNavigate()

  return (
    <div className='container mx-auto py-8 max-w-4xl'>
      <div className='flex items-center mb-6'>
        <Button
          onClick={() => navigate(-1)}
          variant='transparent'
          color='secondary'
          className='text-white/60 hover:text-white'
          leftIcon={<ChevronLeft />}
          iconClassName='w-2 h-2'
          text='Back'
        />
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
