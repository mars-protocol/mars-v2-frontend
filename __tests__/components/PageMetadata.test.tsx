import { render } from '@testing-library/react'
import * as rrd from 'react-router-dom'

import PageMetadata from 'components/PageMetadata'
import PAGE_METADATA from 'constants/pageMetadata'

jest.mock('react-router-dom')
const mockedUseLocation = rrd.useLocation as jest.Mock

describe('<PageMetadata />', () => {
  afterAll(() => {
    jest.clearAllMocks()
  })

  Object.keys(PAGE_METADATA).forEach((page) => {
    it(`should render correct ${page} metadata`, () => {
      const pageKey = page as keyof typeof PAGE_METADATA
      const pageMetadata = PAGE_METADATA[pageKey]

      mockedUseLocation.mockReturnValue({ pathname: pageKey })

      const { container } = render(<PageMetadata />)
      const titleElement = container.querySelector('title')
      const descriptionElement = container.querySelector('meta[name="description"]')
      const keywordsElement = container.querySelector('meta[name="keywords"]')

      expect(titleElement).toHaveTextContent(pageMetadata.title)
      expect(descriptionElement).toHaveAttribute('content', pageMetadata.description)
      expect(keywordsElement).toHaveAttribute('content', pageMetadata.keywords)
    })
  })
})
