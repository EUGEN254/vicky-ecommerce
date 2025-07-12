import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AppContent } from '../context/AppContext'

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedin, adminLoggedIn } = useContext(AppContent)

  if (role === 'admin' && !adminLoggedIn) {
    return <Navigate to="/admin-login" />
  }

  if (role === 'user' && !isLoggedin) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute

