import React from 'react'
import { BrowserRouter, BrowserRouter as Router } from 'react-router-dom'

export default function App({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <Router>
      <BrowserRouter>
        <Component {...pageProps} />
      </BrowserRouter>
    </Router>
  )
}
