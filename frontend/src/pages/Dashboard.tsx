import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboard, DashboardResponse } from '../lib/api'
import './Dashboard.css'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      const result = await getDashboard()
      setLoading(false)

      if (result.error) {
        setError(result.error)
        return
      }

      setDashboard(result.data)
    }

    loadDashboard()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name}!</h1>
          <p>{user?.email}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="dashboard-error">{error}</div>}
      {loading && <div className="dashboard-loading">Loading dashboard...</div>}

      {dashboard && (
        <>
          <div className="dashboard-cards">
            <Link to="/transactions" className="dashboard-card">
              <span>Total Revenue</span>
              <strong>{currency.format(dashboard.totalRevenue)}</strong>
            </Link>
            <Link to="/transactions" className="dashboard-card">
              <span>Total Expenses</span>
              <strong>{currency.format(dashboard.totalExpenses)}</strong>
            </Link>
            <Link to="/transactions" className="dashboard-card">
              <span>Net</span>
              <strong>{currency.format(dashboard.net)}</strong>
            </Link>
            <Link to="/invoices" className="dashboard-card">
              <span>Outstanding Invoices</span>
              <strong>{currency.format(dashboard.outstandingInvoices)}</strong>
            </Link>
          </div>

          <section className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Recent Transactions</h2>
              <Link to="/transactions" className="dashboard-link">
                View all
              </Link>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.category_name || '-'}</td>
                    <td className={transaction.type === 'income' ? 'amount-positive' : 'amount-negative'}>
                      {currency.format(transaction.amount)}
                    </td>
                  </tr>
                ))}
                {dashboard.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4}>No recent transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  )
}
