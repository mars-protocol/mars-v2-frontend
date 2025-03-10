import { Logo } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const TITLE_META = {
  accessorKey: 'name',
  header: 'Vault Title',
  meta: { className: 'max-w-80' },
}

interface Props {
  value: ManagedVaultsData
  isLoading: boolean
}

export default function Title(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center'>
      <span className='h-6 w-6 flex-shrink-0'>
        <Logo />
      </span>
      <div className='overflow-hidden'>
        <TitleAndSubCell
          className='mx-2 text-left truncate overflow-hidden'
          title={value.title}
          sub={value.description}
        />
      </div>
    </div>
  )
}
