import React from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  List, 
  BarChart, 
  Users, 
  User, 
  TrendingUp,
  Building2
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['viewer', 'analyst', 'admin'],
    },
    {
      name: 'Records',
      href: '/records',
      icon: List,
      roles: ['analyst', 'admin'],
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart,
      roles: ['analyst', 'admin'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['viewer', 'analyst', 'admin'],
    },
  ]

  const allowedNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Building2 className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">Finance</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {allowedNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="ml-2 text-sm text-gray-600">Finance Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar