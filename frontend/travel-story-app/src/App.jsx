import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import React from 'react'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Home/Home'

const App = () => {
  return (
      <div>
        <Router>
          <Routes>
            <Route path='/' exact element={<Root />} />
            <Route path='/dashboard' exact element={<Home />} />
            <Route path='/login' exact element={<Login />} />
            <Route path='/signup' exact element={<SignUp />} />
          </Routes>
        </Router>
      </div>
  )
}

// note: define the root component to handle the initial redirect
const Root = () => {
  // info: check if the token exists in localStorage
  const isAuthenticated = !!localStorage.getItem('token');

  // note: redirect to dashboard if authenticated, otherwise to login
  return isAuthenticated ? (
    <Navigate to='/dashboard'/>
  ) : (
    <Navigate to='/login'/>
  )
}

export default App