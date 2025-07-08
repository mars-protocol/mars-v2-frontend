import Button from 'components/common/Button'
import { ChevronLeft } from 'components/common/Icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getRoute } from 'utils/route'

export default function NavigateBackButton() {
  const navigate = useNavigate()
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()

  return (
    <Button
      onClick={() => {
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('tab')
        navigate(getRoute('vaults', newParams, address))
      }}
      variant='transparent'
      color='quaternary'
      className='text-white/60 hover:text-white'
      leftIcon={<ChevronLeft />}
      iconClassName='w-2 h-2'
      text='Back'
    />
  )
}
