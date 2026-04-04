import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/utils'
import api from '../lib/api'
import Layout from '../components/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Skeleton } from '../components/ui/skeleton'

const Analytics = () => {
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [weeklyTrends, setWeeklyTrends] = useState([])
  const [categoryTotals, setCategoryTotals] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedYear])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [monthlyRes, weeklyRes, categoryRes] = await Promise.all([
        api.get(`/api/dashboard/monthly-trends?year=${selectedYear}`),
        api.get('/api/dashboard/weekly-trends?weeks=12'),
        api.get('/api/dashboard/category-totals')
      ])

      setMonthlyTrends(monthlyRes.data.data)
      setWeeklyTrends(weeklyRes.data.data)
      setCategoryTotals(categoryRes.data.data)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

  // Calculate totals for summary cards
  const totalIncome = monthlyTrends.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = monthlyTrends.reduce((sum, item) => sum + item.expenses, 0)
  const avgMonthlyIncome = monthlyTrends.length > 0 ? totalIncome / monthlyTrends.length : 0
  const avgMonthlyExpenses = monthlyTrends.length > 0 ? totalExpenses / monthlyTrends.length : 0

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Detailed financial insights and trends</p>
          </div>
          <div className="w-48">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalIncome)}
              </div>
              <p className="text-sm text-gray-600">Total Income ({selectedYear})</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalExpenses)}
              </div>
              <p className="text-sm text-gray-600">Total Expenses ({selectedYear})</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(avgMonthlyIncome)}
              </div>
              <p className="text-sm text-gray-600">Avg Monthly Income</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">
                {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(avgMonthlyExpenses)}
              </div>
              <p className="text-sm text-gray-600">Avg Monthly Expenses</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends - {selectedYear}</CardTitle>
            <CardDescription>Income vs Expenses by month</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="income" fill="#16a34a" name="Income" />
                  <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trends Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trends</CardTitle>
              <CardDescription>Last 12 weeks activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stackId="1"
                      stroke="#16a34a"
                      fill="#16a34a"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stackId="2"
                      stroke="#dc2626"
                      fill="#dc2626"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Category Breakdown Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Expense distribution by category</CardDescription>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
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
        </div>

        {/* Category Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>Detailed breakdown of expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {categoryTotals.map((category, index) => {
                  const percentage = categoryTotals.length > 0 
                    ? (category.amount / categoryTotals.reduce((sum, cat) => sum + cat.amount, 0)) * 100 
                    : 0
                  
                  return (
                    <div key={category.category} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-600">{percentage.toFixed(1)}% of total expenses</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">{formatCurrency(category.amount)}</div>
                        <div className="text-sm text-gray-600">{category.count} transactions</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Income Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Net Income Trend</CardTitle>
            <CardDescription>Monthly net income (Income - Expenses)</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrends.map(item => ({
                  ...item,
                  netIncome: item.income - item.expenses
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="netIncome" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

export default Analytics