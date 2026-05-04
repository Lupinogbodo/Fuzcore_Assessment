import { FormEvent, useEffect, useState } from 'react'
import { apiCall } from '../lib/api'
import './CustomersPage.css'

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
}

const initialCustomer = {
  id: '',
  name: '',
  email: '',
  phone: '',
  address: '',
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [customerForm, setCustomerForm] = useState<Customer>(initialCustomer)
  const [editingId, setEditingId] = useState<string | null>(null)

  const fetchCustomers = async () => {
    setIsLoading(true)
    const response = await apiCall<Customer[]>('/api/customers')
    if (response.error) {
      setError(response.error)
    } else if (response.data) {
      setCustomers(response.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const openAddForm = () => {
    setCustomerForm(initialCustomer)
    setEditingId(null)
    setError('')
    setShowForm(true)
  }

  const openEditForm = (customer: Customer) => {
    setCustomerForm(customer)
    setEditingId(customer.id)
    setError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setCustomerForm(initialCustomer)
    setEditingId(null)
    setError('')
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!customerForm.name.trim()) {
      setError('Name is required.')
      return
    }

    setIsSaving(true)
    setError('')

    const payload = {
      name: customerForm.name,
      email: customerForm.email || null,
      phone: customerForm.phone || null,
      address: customerForm.address || null,
    }

    const endpoint = editingId
      ? `/api/customers/${editingId}`
      : '/api/customers'
    const method = editingId ? 'PUT' : 'POST'

    const response = await apiCall<Customer>(endpoint, {
      method,
      body: JSON.stringify(payload),
    })

    setIsSaving(false)

    if (response.error) {
      setError(response.error)
      return
    }

    closeForm()
    fetchCustomers()
  }

  const handleDelete = async (customerId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this customer?'
    )
    if (!confirmed) return

    const response = await apiCall<{ success: boolean }>(
      `/api/customers/${customerId}`,
      { method: 'DELETE' }
    )

    if (response.error) {
      setError(response.error)
      return
    }

    setCustomers((prev) => prev.filter((customer) => customer.id !== customerId))
  }

  const handleChange = (
    field: keyof Omit<Customer, 'id'>,
    value: string
  ) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} customers</p>
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          Add Customer
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        {isLoading ? (
          <div className="table-skeleton">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No customers yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email || '—'}</td>
                    <td>{customer.phone || '—'}</td>
                    <td>{customer.address || '—'}</td>
                    <td>
                      <button
                        className="btn-ghost small"
                        onClick={() => openEditForm(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger small"
                        onClick={() => handleDelete(customer.id)}
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

      {showForm && (
        <div className="overlay" onClick={closeForm}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingId ? 'Edit customer' : 'New customer'}</h2>
                <p>{editingId ? 'Update details and save.' : 'Add a new customer.'}</p>
              </div>
              <button className="btn-ghost" onClick={closeForm}>
                Close
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  className="input"
                  value={customerForm.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={customerForm.email || ''}
                  onChange={(event) => handleChange('email', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  className="input"
                  value={customerForm.phone || ''}
                  onChange={(event) => handleChange('phone', event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  className="input"
                  value={customerForm.address || ''}
                  onChange={(event) => handleChange('address', event.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
