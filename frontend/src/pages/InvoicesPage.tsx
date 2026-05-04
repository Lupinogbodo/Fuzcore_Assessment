import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInvoices, InvoiceListItem } from '../lib/api'
import './InvoicePages.css'

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value))
}

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState<'draft' | 'sent' | 'paid' | ''>('')
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvoices() {
      const result = await getInvoices(statusFilter || undefined)
      if (result.error) {
        setError(result.error)
        return
      }
      setInvoices(result.data || [])
    }

    loadInvoices()
  }, [statusFilter])

  return (
    <div className="invoice-page">
      <div className="invoice-controls">
        <h1>Invoices</h1>
        <Link to="/invoices/new">
          <button className="primary">Create New Invoice</button>
        </Link>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as any)}>
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {error && <p className="invoice-error">{error}</p>}

      <table className="invoice-list">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Customer</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.customer_name}</td>
              <td>{invoice.issue_date}</td>
              <td>{invoice.due_date || '-'} </td>
              <td>{formatCurrency(invoice.total)}</td>
              <td className={`invoice-status ${invoice.status}`}>{invoice.status}</td>
              <td>
                <Link to={`/invoices/${invoice.id}`}>
                  <button className="secondary">View</button>
                </Link>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={7}>No invoices found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
