import Text from 'components/common/Text'

interface Props {
  label: string
  children: React.ReactNode
}

export default function InfoRow(props: Props) {
  const { label, children } = props

  return (
    <div className='flex justify-between'>
      <Text size='sm' className='text-white/60'>
        {label}
      </Text>
      {children}
    </div>
  )
}
