import { render } from '@testing-library/react'

import { CircularProgress } from 'components/CircularProgress'
import { REDUCE_MOTION_KEY } from 'constants/localStore'

describe('<CircularProgress />', () => {
  afterAll(() => {
    localStorage.removeItem(REDUCE_MOTION_KEY)
  })

  it('should render', () => {
    const { container } = render(<CircularProgress />)

    expect(container).toBeInTheDocument()
  })

  it('should render `...` when animations disabled', () => {
    localStorage.setItem(REDUCE_MOTION_KEY, 'true')

    const { getByText } = render(<CircularProgress />)
    const threeDots = getByText('...')

    expect(threeDots).toBeInTheDocument()
  })

  it('should render the component with animation classes when animations enabled', () => {
    localStorage.setItem(REDUCE_MOTION_KEY, 'false')

    const { container } = render(<CircularProgress />)
    const progressWithAnimations = container.querySelector('.animate-progress')

    expect(progressWithAnimations).toBeInTheDocument()
  })
})
