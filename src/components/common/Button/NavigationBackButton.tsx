import Button from 'components/common/Button'
import { ChevronLeft } from 'components/common/Icons'
import { useNavigate } from 'react-router-dom'

export default function NavigationBackButton() {
  const navigate = useNavigate()

  return (
    <Button
      onClick={() => navigate(-1)}
      variant='transparent'
      color='quaternary'
      className='text-white/60 hover:text-white'
      leftIcon={<ChevronLeft />}
      iconClassName='w-2 h-2'
      text='Back'
    />
  )
}
