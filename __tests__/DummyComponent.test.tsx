import { render, screen } from '@testing-library/react'

import DummyComponent from 'components/DummyComponent'

describe('<DummyComponent />', () => {
  it('should render correctly', () => {
    render(<DummyComponent />)

    const content = screen.getByText('Hello World!x')
    expect(content).toBeInTheDocument()
  })
})
