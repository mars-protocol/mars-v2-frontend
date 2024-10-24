import Text from 'components/common/Text'

interface Props {
  fee: string
}
export default function FeeTag(props: Props) {
  const { fee } = props

  return (
    <Text tag='span' className='rounded-sm px-2 py-0.5 bg-white/10 text-white/60' size='xs'>
      {fee}% Fee
    </Text>
  )
}
