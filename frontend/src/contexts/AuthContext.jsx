import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
      }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('finance_token')
    const userStr = localStorage.getItem('finance_user')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        dispatch({ type: 'SET_USER', payload: { user, token } })
      } catch (error) {
        localStorage.removeItem('finance_token')
        localStorage.removeItem('finance_user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user } = response.data.data
      
      localStorage.setItem('finance_token', token)
      localStorage.setItem('finance_user', JSON.stringify(user))
      
      dispatch({ type: 'SET_USER', payload: { user, token } })
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      }
    }
  }

  const register = async (name, email, password, role = 'viewer') => {
    try {
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role,
      })
      
      return { success: true, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('finance_token')
    localStorage.removeItem('finance_user')
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}