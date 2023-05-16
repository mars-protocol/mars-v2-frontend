import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import Routes from 'components/Routes'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}
