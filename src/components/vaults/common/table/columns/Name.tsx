import { Logo } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = {
  accessorKey: 'name',
  header: 'Vault Name',
  meta: { className: 'min-w-50' },
}

interface Props {
  value: VaultData
  isLoading: boolean
}

export default function Name(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center'>
      {/* demo asset image */}
      <Logo className='h-6 w-6' />
      <TitleAndSubCell className='ml-2 mr-2 text-left' title={value.name} sub={value.subtitle} />
    </div>
  )
}
