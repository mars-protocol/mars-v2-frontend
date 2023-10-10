import { render } from '@testing-library/react'

import Footer from 'components/Footer'

import packageJSON from '../package.json'

describe('<Footer />', () => {
  it('should render package version correctly', () => {
    const { getByText, container } = render(<Footer />)
    const versionText = getByText(`v${packageJSON.version}`)

    expect(versionText).toBeInTheDocument()
  })
})
