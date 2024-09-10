import Card from 'components/common/Card'
import FullOverlayContent from 'components/common/FullOverlayContent'

interface Props {
  children: React.ReactNode
}

export default function CreateVaultOverlay(props: Props) {
  const { children } = props

  return (
    <FullOverlayContent
      title='Create Vault'
      copy='We’ll require you to authorise a transaction in your wallet in order to begin.'
      className='md:w-full max-w-modal md:relative'
    >
      <Card className='p-2 md:p-6 bg-white/5 w-full'>{children}</Card>
    </FullOverlayContent>
  )
}
