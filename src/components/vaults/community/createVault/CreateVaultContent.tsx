import classNames from 'classnames'
import Card from 'components/common/Card'
import FullOverlayContent from 'components/common/FullOverlayContent'

interface Props {
  children: React.ReactNode
  cardClassName?: string
}

export default function CreateVaultContent(props: Props) {
  const { children, cardClassName } = props

  return (
    <FullOverlayContent
      title='Create Vault'
      copy='We’ll require you to authorise a transaction in your wallet in order to begin.'
      className='max-w-modal md:w-full md:relative'
    >
      <Card className={classNames('p-2 md:p-6 bg-white/5 w-full', cardClassName)}>{children}</Card>
    </FullOverlayContent>
  )
}
