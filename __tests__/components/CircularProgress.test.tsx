import { render } from '@testing-library/react'

import { CircularProgress } from 'components/CircularProgress'
import useStore from 'store'

describe('<CircularProgress />', () => {
  afterAll(() => {
    useStore.clearState()
  })

  it('should render', () => {
    const { container } = render(<CircularProgress />)

    expect(container).toBeInTheDocument()
  })

  it('should render `...` when animations disabled', () => {
    useStore.setState({ enableAnimations: false })

    const { getByText } = render(<CircularProgress />)
    const threeDots = getByText('...')

    expect(threeDots).toBeInTheDocument()
  })

  it('should render the component with animation classes when animations enabled', () => {
    useStore.setState({ enableAnimations: true })

    const { container } = render(<CircularProgress />)
    const progressWithAnimations = container.querySelector('.animate-progress')

    expect(progressWithAnimations).toBeInTheDocument()
  })
})
