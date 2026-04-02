import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, ShieldCheck, Eye, BarChart2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, formatDate } from '../lib/utils'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [recentRecords, setRecentRecords] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [categoryTotals, setCategoryTotals] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const canViewAnalytics = ['analyst', 'admin'].includes(user?.role)
  const isAdmin = user?.role === 'admin'
  const isViewer = user?.role === 'viewer'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, recentRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/dashboard/recent?limit=10')
        ])

        setSummary(summaryRes.data.data)
        setRecentRecords(recentRes.data.data)

        if (canViewAnalytics) {
          const [monthlyRes, categoryRes] = await Promise.all([
            api.get(`/api/dashboard/monthly-trends?year=${new Date().getFullYear()}`),
            api.get('/api/dashboard/category-totals')
          ])

          setMonthlyTrends(monthlyRes.data.data)
          setCategoryTotals(categoryRes.data.data)
        }

        if (isAdmin) {
          const usersRes = await api.get('/api/users')
          const users = usersRes.data.data
          const stats = {
            total: users.length,
            active: users.filter(u => u.status === 'active').length,
            admins: users.filter(u => u.role === 'admin').length,
            analysts: users.filter(u => u.role === 'analyst').length,
            viewers: users.filter(u => u.role === 'viewer').length,
          }
          setUserStats(stats)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [canViewAnalytics, isAdmin])

  const summaryCards = [
    {
      title: 'Total Income',
      value: summary?.totalIncome || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Expenses',
      value: summary?.totalExpenses || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Net Balance',
      value: summary?.netBalance || 0,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Records',
      value: summary?.recordCount || 0,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      isCount: true,
    },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Role info banner */}
        {isViewer && (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <Eye className="h-4 w-4 shrink-0" />
            <span>You have <strong>Viewer</strong> access — you can view dashboard data and recent transactions.</span>
          </div>
        )}
        {user?.role === 'analyst' && (
          <div className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-700">
            <BarChart2 className="h-4 w-4 shrink-0" />
            <span>You have <strong>Analyst</strong> access — you can view records, add new records, and access analytics insights.</span>
          </div>
        )}
        {isAdmin && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>You have <strong>Admin</strong> access — you can create, update, and manage all records and users.</span>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card) => (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        {card.isCount 
                          ? card.value.toLocaleString()
                          : formatCurrency(card.value)
                        }
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Admin: User Overview */}
        {isAdmin && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              User Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Total Users', value: userStats?.total, color: 'text-gray-900', bg: 'bg-gray-100' },
                { label: 'Active', value: userStats?.active, color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'Admins', value: userStats?.admins, color: 'text-red-700', bg: 'bg-red-100' },
                { label: 'Analysts', value: userStats?.analysts, color: 'text-indigo-700', bg: 'bg-indigo-100' },
                { label: 'Viewers', value: userStats?.viewers, color: 'text-yellow-700', bg: 'bg-yellow-100' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    {loading || !userStats ? (
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                    ) : (
                      <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          {canViewAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Income vs Expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Category Breakdown */}
          {canViewAnalytics && (
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryTotals}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {categoryTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.category}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.type === 'income' ? 'success' : 'destructive'}
                        >
                          {record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={record.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(record.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {record.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Dashboard