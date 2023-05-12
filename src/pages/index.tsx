import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path='/trade' element={<h1>Trade Component will be rendered here!</h1>} />
        <Route path='/council' element={<h1>Council Component will be rendered here!</h1>} />
        <Route path='/' element={<h1>Home</h1>} />
      </Routes>
    </Router>
  )
}
