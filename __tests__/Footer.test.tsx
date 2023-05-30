import { shallow } from 'enzyme'

import Footer from 'components/Footer'
import Text from 'components/Text'

import packageJSON from '../package.json'

describe('<Footer />', () => {
  it('should render correctly', () => {
    const wrapper = shallow(<Footer />)
    const textComponent = wrapper.find(Text).at(0)
    const text = textComponent.dive().text()

    expect(text).toBe(`v${packageJSON.version}`)
  })
})
