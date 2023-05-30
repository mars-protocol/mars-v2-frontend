import '@testing-library/jest-dom/extend-expect'

import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

configure({ adapter: new Adapter() })

jest.mock('react-helmet', () => {
  const React = require('react')
  const plugin = jest.requireActual('react-helmet')
  const mockHelmet = ({ children, ...props }) =>
    React.createElement(
      'div',
      {
        ...props,
        className: 'mock-helmet',
      },
      children,
    )
  return {
    ...plugin,
    Helmet: jest.fn().mockImplementation(mockHelmet),
  }
})
