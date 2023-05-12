import { render, screen } from '@testing-library/react'

import Footer from 'components/Footer'

import packageJSON from '../package.json'

describe('<Footer />', () => {
  it('should render correctly', () => {
    render(<Footer />)

    const content = screen.getByText(`v${packageJSON.version}`)
    expect(content).toBeInTheDocument()
  })
})
