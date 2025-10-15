import Text from 'components/common/Text'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import moment from 'moment'

interface Props {
  value: string
}

export default function Timestamp(props: Props) {
  const { value } = props
  if (!value) return <Text size='xs'>N/A</Text>

  const timestamp = Math.floor(parseInt(value) / 1000)
  const date = moment.unix(timestamp).utc()

  return (
    <TitleAndSubCell
      title={<Text size='xs'>{date.format('MMM D, YYYY')}</Text>}
      sub={<Text size='xs'>{date.format('HH:mm')} UTC</Text>}
    />
  )
}
