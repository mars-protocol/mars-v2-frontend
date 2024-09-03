import AssetImage from 'components/common/assets/AssetImage'
import { Logo } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import TitleAndSubCell from 'components/common/TitleAndSubCell'

export const NAME_META = {
  accessorKey: 'name',
  header: 'Vault Name',
  meta: { className: 'min-w-50' },
}

interface Props {
  value: Vaults
}

export default function Name(props: Props) {
  const { value } = props
  console.log('value:', value)
  return (
    <div className='flex items-center'>
      <Logo className='h-6 w-6' />
      {/* <AssetImage asset={} className='w-8 h-8' /> */}
      <TitleAndSubCell
        className='ml-2 mr-2 text-left'
        title={value.vaultName}
        sub={value.vaultSub}
      />
    </div>
  )
}
