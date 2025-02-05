import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import moment from 'moment'

export const TIMESTAMP_META = {
  id: 'name',
  header: 'Initiated',
  meta: { className: 'min-w-30' },
}

interface Props {
  value: number | string
  isLoading: boolean
}

export default function Timestamp(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  const timestamp = typeof value === 'string' ? parseInt(value) : value
  const date = moment(timestamp * 1000)

  const dateInitiated = date.format('MMM D, YYYY')
  const timeInitiated = date.format('hh:mm A')

  return <TitleAndSubCell title={dateInitiated} sub={timeInitiated} />
}
