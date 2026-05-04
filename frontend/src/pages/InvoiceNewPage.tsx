import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInvoice, getCustomers, InvoiceItem } from '../lib/api'
import './InvoicePages.css'

interface Customer {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
}

export default function InvoiceNewPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<Array<Pick<InvoiceItem, 'description' | 'quantity' | 'unit_price'>>>([
    { description: '', quantity: 1, unit_price: 0 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadCustomers() {
      const result = await getCustomers()
      if (result.error) {
        setError(result.error)
        return
      }
      setCustomers(result.data || [])
      if (result.data?.length) {
        setSelectedCustomer(result.data[0].id)
      }
    }

    loadCustomers()
  }, [])

  const total = useMemo(
    () =>
      lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    [lineItems]
  )

  const handleLineItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    setLineItems((items) =>
      items.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: field === 'description' ? value : Number(value),
            }
          : item
      )
    )
  }

  const addLineItem = () => {
    setLineItems((items) => [...items, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems((items) => items.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (!selectedCustomer) {
      setError('Please select a customer.')
      return
    }

    if (lineItems.some((item) => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
      setError('Please complete all line items with valid quantities and prices.')
      return
    }

    setSaving(true)
    const response = await createInvoice({
      customer_id: selectedCustomer,
      due_date: dueDate || undefined,
      notes: notes || undefined,
      items: lineItems,
    })
    setSaving(false)

    if (response.error) {
      setError(response.error)
      return
    }

    navigate('/invoices')
  }

  return (
    <div className="invoice-page">
      <h1>Create Invoice</h1>
      <form className="invoice-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="customer">Customer</label>
          <select
            id="customer"
            value={selectedCustomer}
            onChange={(event) => setSelectedCustomer(event.target.value)}
          >
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div>
          <h2>Line Items</h2>
          <table className="invoice-items">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(event) => handleLineItemChange(index, 'description', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => handleLineItemChange(index, 'quantity', event.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(event) => handleLineItemChange(index, 'unit_price', event.target.value)}
                    />
                  </td>
                  <td>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.quantity * item.unit_price)}</td>
                  <td>
                    <button type="button" className="danger" onClick={() => removeLineItem(index)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="secondary" onClick={addLineItem}>
            Add Line Item
          </button>
        </div>

        <div className="invoice-total">
          Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
        </div>

        {error && <p className="invoice-error">{error}</p>}

        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  )
}
