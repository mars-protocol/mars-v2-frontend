import { render, screen } from '@testing-library/react'
import Card from 'components/Card'
import { shallow } from 'enzyme'
import Text from 'components/Text'
import Button from 'components/Button'

describe('<Card />', () => {
  const defaultProps = {
    children: <></>,
  }

  it('should render', () => {
    const { container } = render(<Card {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Card {...defaultProps} className={testClass} />)
    expect(container.querySelector('section')).toHaveClass(testClass)
  })

  it('should handle `contentClassName` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Card {...defaultProps} contentClassName={testClass} />)

    expect(container.querySelector('div')).toHaveClass(testClass)
  })

  it('should handle `title` prop as string correctly', () => {
    const testTitle = 'test-title'
    const wrapper = shallow(<Card {...defaultProps} title={testTitle} />)
    const textComponent = wrapper.find(Text).at(0)
    const text = textComponent.dive().text()

    expect(text).toBe(testTitle)
  })

  it('should handle `title` prop as element correctly', () => {
    const testTitle = <p className='test-class'>Test title</p>
    const wrapper = shallow(<Card {...defaultProps} title={testTitle} />)
    expect(wrapper.find('p.test-class')).toHaveLength(1)
    expect(wrapper.find(Text)).toHaveLength(0)
  })

  it('should handle `id` prop as element correctly', () => {
    const testId = 'test-id'
    const wrapper = shallow(<Card {...defaultProps} id={testId} />)
    expect(wrapper.find(`section#${testId}`).at(0)).toHaveLength(1)
  })
})
