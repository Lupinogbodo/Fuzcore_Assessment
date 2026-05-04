import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  createTransaction,
  deleteTransaction,
  getCategories,
  getTransactions,
} from '../lib/api'
import { formatCurrency } from '../lib/format'
import './TransactionsPage.css'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  description?: string | null
  date: string
  category_id?: string | null
  category_name?: string | null
}

const initialFormState = {
  amount: '',
  type: 'income' as 'income' | 'expense',
  category_id: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formState, setFormState] = useState(initialFormState)

  const fetchCategories = async (type?: 'income' | 'expense') => {
    const response = await getCategories(type)
    if (response.error) {
      setError(response.error)
      return
    }
    setCategories(response.data ?? [])
  }

  const fetchTransactions = async () => {
    setLoading(true)
    const response = await getTransactions({
      type: typeFilter === 'all' ? undefined : typeFilter,
      category_id: categoryFilter || undefined,
    })

    if (response.error) {
      setError(response.error)
      setLoading(false)
      return
    }

    setTransactions(response.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories(typeFilter === 'all' ? undefined : typeFilter)
  }, [typeFilter])

  useEffect(() => {
    fetchTransactions()
  }, [typeFilter, categoryFilter])

  const totals = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    const expense = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    return {
      income,
      expense,
      net: income - expense,
    }
  }, [transactions])

  const openForm = () => {
    setFormState(initialFormState)
    setError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setError('')
  }

  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    if (!formState.amount || !formState.type) {
      setError('Amount and type are required.')
      return
    }

    setSubmitLoading(true)

    const response = await createTransaction({
      amount: Number(formState.amount),
      type: formState.type,
      category_id: formState.category_id || null,
      description: formState.description || null,
      date: formState.date,
    })

    setSubmitLoading(false)

    if (response.error) {
      setError(response.error)
      return
    }

    closeForm()
    fetchTransactions()
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this transaction?')
    if (!confirmed) return

    const response = await deleteTransaction(id)
    if (response.error) {
      setError(response.error)
      return
    }

    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <div>
          <h1>Transactions</h1>
          <p>{transactions.length} entries</p>
        </div>
        <button className="btn-primary" onClick={openForm}>
          Add Transaction
        </button>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <span>Total Income</span>
          <strong>{formatCurrency(totals.income)}</strong>
        </div>
        <div className="summary-card">
          <span>Total Expenses</span>
          <strong>{formatCurrency(totals.expense)}</strong>
        </div>
        <div className="summary-card">
          <span>Net</span>
          <strong>{formatCurrency(totals.net)}</strong>
        </div>
      </div>

      <div className="filter-bar">
        <label>
          Type
          <select
            className="input"
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value as 'all' | 'income' | 'expense')
              setCategoryFilter('')
            }}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label>
          Category
          <select
            className="input"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {loading ? (
          <div className="table-skeleton">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description || '—'}</td>
                    <td>{transaction.category_name || '—'}</td>
                    <td>
                      <span
                        className={`badge badge-${transaction.type}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={
                        transaction.type === 'income' ? 'amount-income' : 'amount-expense'
                      }
                    >
                      {formatCurrency(Number(transaction.amount))}
                    </td>
                    <td>
                      <button
                        className="btn-danger small"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isFormOpen && (
        <div className="overlay" onClick={closeForm}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Add transaction</h2>
                <p>Capture income or expense details.</p>
              </div>
              <button className="btn-ghost" onClick={closeForm}>
                Close
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  className="input"
                  value={formState.amount}
                  onChange={(event) => handleFormChange('amount', event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="type">Type</label>
                <select
                  id="type"
                  className="input"
                  value={formState.type}
                  onChange={(event) => {
                    handleFormChange('type', event.target.value as 'income' | 'expense')
                    if (event.target.value === 'income') {
                      fetchCategories('income')
                    } else {
                      fetchCategories('expense')
                    }
                    handleFormChange('category_id', '')
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  className="input"
                  value={formState.category_id}
                  onChange={(event) => handleFormChange('category_id', event.target.value)}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  className="input"
                  value={formState.description}
                  onChange={(event) => handleFormChange('description', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  className="input"
                  value={formState.date}
                  onChange={(event) => handleFormChange('date', event.target.value)}
                />
              </div>

              {error && <div className="error-banner">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitLoading}>
                  {submitLoading ? 'Saving...' : 'Save transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
