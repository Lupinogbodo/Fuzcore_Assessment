import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteInvoice, getInvoice, InvoiceDetail, updateInvoiceStatus } from '../lib/api'
import './InvoicePages.css'

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value))
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return

    async function loadInvoice(invoiceId: string) {
      const result = await getInvoice(invoiceId)
      if (result.error) {
        setError(result.error)
        return
      }
      setInvoice(result.data)
    }

    loadInvoice(id)
  }, [id])

  const handleStatusChange = async (newStatus: 'sent' | 'paid') => {
    if (!id) return
    setSaving(true)
    const result = await updateInvoiceStatus(id, newStatus)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      setInvoice((current) => (current ? { ...current, status: result.data!.status } : current))
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setSaving(true)
    const result = await deleteInvoice(id)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate('/invoices')
  }

  if (!invoice) {
    return (
      <div className="invoice-page">
        <h1>Invoice details</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="invoice-page">
      <div className="invoice-controls">
        <div>
          <h1>{invoice.invoice_number}</h1>
          <p>{invoice.customer_name}</p>
        </div>
        <button className="secondary" onClick={() => navigate('/invoices')}>
          Back to invoices
        </button>
      </div>

      <div className="invoice-form">
        <div>
          <strong>Status:</strong>{' '}
          <span className={`invoice-status ${invoice.status}`}>{invoice.status}</span>
        </div>
        <div>
          <strong>Issue Date:</strong> {invoice.issue_date}
        </div>
        <div>
          <strong>Due Date:</strong> {invoice.due_date || '-'}
        </div>
        {invoice.notes && (
          <div>
            <strong>Notes:</strong>
            <p>{invoice.notes}</p>
          </div>
        )}
        <div>
          <strong>Customer Details:</strong>
          <p>{invoice.customer_email}</p>
          <p>{invoice.customer_phone}</p>
          <p>{invoice.customer_address}</p>
        </div>
      </div>

      <table className="invoice-items">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unit_price)}</td>
              <td>{formatCurrency(item.quantity * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-total">Invoice Total: {formatCurrency(invoice.total)}</div>

      {error && <p className="invoice-error">{error}</p>}

      <div className="invoice-actions">
        {invoice.status === 'draft' && (
          <button className="primary" onClick={() => handleStatusChange('sent')} disabled={saving}>
            Mark as Sent
          </button>
        )}
        {invoice.status === 'sent' && (
          <button className="primary" onClick={() => handleStatusChange('paid')} disabled={saving}>
            Mark as Paid
          </button>
        )}
        {invoice.status === 'draft' && (
          <button className="danger" onClick={handleDelete} disabled={saving}>
            Delete Invoice
          </button>
        )}
      </div>
    </div>
  )
}
