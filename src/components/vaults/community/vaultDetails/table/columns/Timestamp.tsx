import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

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
  const date = new Date(timestamp * 1000)

  const dateInitiated = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const timeInitiated = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  return <TitleAndSubCell title={dateInitiated} sub={timeInitiated} />
}
