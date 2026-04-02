import React from 'react'
import { User, Shield, Calendar, CheckCircle, XCircle, Eye, BarChart, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/utils'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'

const Profile = () => {
  const { user } = useAuth()

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'analyst':
        return 'default'
      case 'viewer':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const rolePermissions = {
    viewer: [
      { action: 'View dashboard', allowed: true },
      { action: 'View records', allowed: true },
      { action: 'Create records', allowed: false },
      { action: 'Edit records', allowed: false },
      { action: 'Delete records', allowed: false },
      { action: 'View analytics', allowed: false },
      { action: 'Manage users', allowed: false },
    ],
    analyst: [
      { action: 'View dashboard', allowed: true },
      { action: 'View records', allowed: true },
      { action: 'Create records', allowed: true },
      { action: 'Edit records', allowed: false },
      { action: 'Delete records', allowed: false },
      { action: 'View analytics', allowed: true },
      { action: 'Manage users', allowed: false },
    ],
    admin: [
      { action: 'View dashboard', allowed: true },
      { action: 'View records', allowed: true },
      { action: 'Create records', allowed: true },
      { action: 'Edit records', allowed: true },
      { action: 'Delete records', allowed: true },
      { action: 'View analytics', allowed: true },
      { action: 'Manage users', allowed: true },
    ],
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Shield
      case 'analyst':
        return BarChart
      case 'viewer':
        return Eye
      default:
        return User
    }
  }

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin':
        return 'Full system access with user management capabilities'
      case 'analyst':
        return 'Can create records and access analytics and reporting features'
      case 'viewer':
        return 'Read-only access to dashboard and records'
      default:
        return 'Unknown role'
    }
  }

  const userPermissions = rolePermissions[user?.role] || []
  const RoleIcon = getRoleIcon(user?.role)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Your account information and permissions</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your personal account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xl font-semibold text-indigo-600">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{user?.name}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Role</span>
                  <Badge variant={getRoleBadgeVariant(user?.role)}>
                    {user?.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Member since</span>
                  <span className="text-sm text-gray-900">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Account ID</span>
                  <span className="text-sm font-mono text-gray-900">
                    {user?.id || 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RoleIcon className="mr-2 h-5 w-5" />
                Role Information
              </CardTitle>
              <CardDescription>Your role and its capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-lg capitalize">{user?.role}</h4>
                  <Badge variant={getRoleBadgeVariant(user?.role)}>
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {getRoleDescription(user?.role)}
                </p>
              </div>

              <div>
                <h5 className="font-medium mb-3 flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  Access Permissions
                </h5>
                <div className="space-y-2">
                  {userPermissions.map((permission, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{permission.action}</span>
                      {permission.allowed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Role Comparison</CardTitle>
            <CardDescription>Overview of all available roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Permission</th>
                    <th className="text-center py-3 px-4 font-medium">
                      <div className="flex items-center justify-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Viewer
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      <div className="flex items-center justify-center">
                        <BarChart className="mr-2 h-4 w-4" />
                        Analyst
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      <div className="flex items-center justify-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rolePermissions.viewer.map((permission, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{permission.action}</td>
                      <td className="py-3 px-4 text-center">
                        {rolePermissions.viewer[index].allowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rolePermissions.analyst[index].allowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {rolePermissions.admin[index].allowed ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Profile