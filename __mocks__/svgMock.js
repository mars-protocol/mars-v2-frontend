/* eslint-disable react/display-name */
import React from 'react'

const SvgrMock = React.forwardRef((props, ref) => <svg ref={ref} {...props} />)

export const ReactComponent = SvgrMock
export default SvgrMock
