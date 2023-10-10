jest.mock('react-helmet-async', () => {
  const React = require('react')
  const plugin = jest.requireActual('react-helmet-async')
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