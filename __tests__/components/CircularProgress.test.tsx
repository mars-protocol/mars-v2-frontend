import { render } from '@testing-library/react'

import { CircularProgress } from 'components/CircularProgress'
import { LocalStorageKeys } from 'constants/localStorageKeys'

describe('<CircularProgress />', () => {
  afterAll(() => {
    localStorage.removeItem(LocalStorageKeys.REDUCE_MOTION)
  })

  it('should render', () => {
    const { container } = render(<CircularProgress />)

    expect(container).toBeInTheDocument()
  })

  it('should render `...` when animations disabled', () => {
    localStorage.setItem(LocalStorageKeys.REDUCE_MOTION, 'true')

    const { getByText } = render(<CircularProgress />)
    const threeDots = getByText('...')

    expect(threeDots).toBeInTheDocument()
  })

  it('should render the component with animation classes when animations enabled', () => {
    localStorage.setItem(LocalStorageKeys.REDUCE_MOTION, 'false')

    const { container } = render(<CircularProgress />)
    const progressWithAnimations = container.querySelector('.animate-progress')

    expect(progressWithAnimations).toBeInTheDocument()
  })
})
