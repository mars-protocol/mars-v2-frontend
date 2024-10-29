import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const TIMESTAMP_META = {
  id: 'name',
  header: 'Unfreezes',
  meta: { className: 'min-w-30' },
}

interface Props {
  // TODO: update once we know data structure
  value: any
  isLoading: boolean
}

export default function Timestamp(props: Props) {
  const { value, isLoading } = props
  // TODO: update values once we know the structure

  if (isLoading) return <Loading />

  return <TitleAndSubCell title={value.unfreeze_date} sub={value.unfreeze_time} />
}
