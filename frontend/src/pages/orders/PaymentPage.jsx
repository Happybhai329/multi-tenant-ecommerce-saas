import { useState, useEffect } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetchOrderById } from '../../api/orderApi'
import { createPaymentIntent, confirmMockPayment } from '../../api/paymentApi'

function PaymentPage() {
  const { id } = useParams()
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Payment state
  const [paymentState, setPaymentState] = useState('idle') // idle | creating | success | error
  const [paymentData, setPaymentData] = useState(null)
  const [paymentError, setPaymentError] = useState(null)
  const [simulating, setSimulating] = useState(false)

  useEffect(() => {
    if (!token) return

    const loadOrder = async () => {
      try {
        setLoading(true)
        const { data } = await fetchOrderById(id)
        setOrder(data.order)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id, token])

  // Redirect if not authenticated
  if (!token) {
    return <Navigate to="/login" replace />
  }

  const handleCreatePaymentIntent = async () => {
    setPaymentState('creating')
    setPaymentError(null)
    try {
      const { data } = await createPaymentIntent(id)
      setPaymentData(data)
      setPaymentState('success')
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to create payment intent')
      setPaymentState('error')
    }
  }

  const handleSimulatePayment = async (status) => {
    if (!paymentData?.paymentIntentId) return
    setSimulating(true)
    try {
      await confirmMockPayment(paymentData.paymentIntentId, status)
      if (status === 'success') {
        navigate(`/payment/success?order=${order._id}`, { replace: true })
      } else {
        navigate(`/payment/failed?order=${order._id}`, { replace: true })
      }
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Failed to process simulated payment')
    } finally {
      setSimulating(false)
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99, 102, 241, 0.2)',
            borderTopColor: '#6366f1',
            borderRadius: '50%',
            animation: 'paymentSpin 0.8s linear infinite'
          }} />
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          color: '#fca5a5',
          fontSize: '14px'
        }}>
          {error}
        </div>
        <Link to="/orders" style={{
          display: 'inline-block',
          marginTop: '16px',
          color: '#9ca3af',
          fontSize: '14px',
          textDecoration: 'none'
        }}>
          ← Back to Orders
        </Link>
      </div>
    )
  }

  if (!order) return null

  const isAlreadyPaid = order.paymentStatus === 'paid'

  return (
    <>
      <style>{`
        @keyframes paymentSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes paymentFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes paymentPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes paymentShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes paymentCheckmark {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .payment-page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 16px;
          animation: paymentFadeIn 0.5s ease-out;
        }
        .payment-breadcrumb {
          font-size: 13px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .payment-breadcrumb a {
          color: #6b7280;
          text-decoration: none;
          transition: color 0.2s;
        }
        .payment-breadcrumb a:hover {
          color: #d1d5db;
        }
        .payment-breadcrumb span {
          margin: 0 8px;
        }
        .payment-title {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }
        .payment-order-number {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 32px;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .payment-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* ─── Order Summary Card ─── */
        .payment-summary-card {
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
        }
        .payment-summary-heading {
          font-size: 16px;
          font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .payment-item-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(75, 85, 99, 0.15);
        }
        .payment-item-row:last-child {
          border-bottom: none;
        }
        .payment-item-image {
          width: 44px;
          height: 44px;
          background: rgba(31, 41, 55, 0.8);
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .payment-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .payment-item-details {
          flex: 1;
          min-width: 0;
        }
        .payment-item-title {
          font-size: 14px;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .payment-item-qty {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }
        .payment-item-price {
          font-size: 14px;
          font-weight: 500;
          color: #e5e7eb;
          flex-shrink: 0;
        }

        /* ─── Totals ─── */
        .payment-totals {
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          margin-top: 16px;
          padding-top: 16px;
        }
        .payment-total-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .payment-total-label {
          color: #9ca3af;
        }
        .payment-total-value {
          color: #e5e7eb;
        }
        .payment-total-value.free {
          color: #34d399;
        }
        .payment-grand-total {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(75, 85, 99, 0.3);
          padding-top: 12px;
          margin-top: 4px;
        }
        .payment-grand-total-label {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }
        .payment-grand-total-value {
          font-size: 18px;
          font-weight: 700;
          background: linear-gradient(135deg, #818cf8, #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ─── Payment Action Card ─── */
        .payment-action-card {
          background: rgba(17, 24, 39, 0.6);
          border: 1px solid rgba(75, 85, 99, 0.3);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
        }
        .payment-action-heading {
          font-size: 16px;
          font-weight: 600;
          color: #e5e7eb;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ─── Status Badge ─── */
        .payment-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .payment-status-badge.pending {
          background: rgba(251, 191, 36, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.2);
        }
        .payment-status-badge.paid {
          background: rgba(52, 211, 153, 0.12);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.2);
        }
        .payment-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: paymentPulse 2s ease-in-out infinite;
        }
        .payment-status-dot.pending {
          background: #fbbf24;
        }
        .payment-status-dot.paid {
          background: #34d399;
        }

        /* ─── Payment Placeholder ─── */
        .payment-card-placeholder {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
          border: 1px dashed rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          margin: 16px 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .payment-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .payment-card-text {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.5;
        }
        .payment-card-text strong {
          color: #c7d2fe;
          font-weight: 500;
        }

        /* ─── Create Intent Button ─── */
        .payment-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          outline: none;
          position: relative;
          overflow: hidden;
        }
        .payment-create-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
        }
        .payment-create-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .payment-create-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .payment-create-btn.creating {
          background: linear-gradient(90deg,
            rgba(99, 102, 241, 0.4) 0%,
            rgba(139, 92, 246, 0.6) 50%,
            rgba(99, 102, 241, 0.4) 100%
          );
          background-size: 200% 100%;
          animation: paymentShimmer 1.5s linear infinite;
        }

        /* ─── Success State ─── */
        .payment-success-card {
          background: rgba(52, 211, 153, 0.06);
          border: 1px solid rgba(52, 211, 153, 0.2);
          border-radius: 12px;
          padding: 24px;
          margin: 16px 0;
          flex: 1;
          animation: paymentFadeIn 0.4s ease-out;
        }
        .payment-success-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(52, 211, 153, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          animation: paymentCheckmark 0.5s ease-out;
        }
        .payment-success-title {
          font-size: 16px;
          font-weight: 600;
          color: #34d399;
          text-align: center;
          margin-bottom: 8px;
        }
        .payment-success-subtitle {
          font-size: 13px;
          color: #9ca3af;
          text-align: center;
          margin-bottom: 20px;
        }
        .payment-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid rgba(75, 85, 99, 0.15);
        }
        .payment-detail-row:last-child {
          border-bottom: none;
        }
        .payment-detail-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .payment-detail-value {
          font-size: 13px;
          color: #d1d5db;
          font-family: 'SF Mono', 'Fira Code', monospace;
          text-align: right;
          overflow-wrap: anywhere;
          max-width: 58%;
        }

        /* ─── Error Message ─── */
        .payment-sim-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }
        @media (max-width: 420px) {
          .payment-sim-actions {
            flex-direction: column;
          }
        }
        .payment-error-msg {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: 10px;
          padding: 14px 16px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 12px;
          animation: paymentFadeIn 0.3s ease-out;
        }

        /* ─── Already Paid Banner ─── */
        .payment-paid-banner {
          background: rgba(52, 211, 153, 0.06);
          border: 1px solid rgba(52, 211, 153, 0.2);
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          margin: 16px 0;
          flex: 1;
        }
        .payment-paid-banner p {
          font-size: 15px;
          color: #34d399;
          font-weight: 500;
        }
        .payment-paid-banner .sub {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 6px;
        }

        /* ─── View Order Link ─── */
        .payment-view-order-link {
          display: block;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          text-decoration: none;
          margin-top: 16px;
          transition: color 0.2s;
        }
        .payment-view-order-link:hover {
          color: #d1d5db;
        }
      `}</style>

      <div className="payment-page-container">
        {/* Breadcrumb */}
        <div className="payment-breadcrumb">
          <Link to="/orders">Orders</Link>
          <span>›</span>
          <Link to={`/orders/${order._id}`}>{order.orderNumber}</Link>
          <span>›</span>
          <span style={{ color: '#d1d5db' }}>Payment</span>
        </div>

        <h1 className="payment-title">Complete Payment</h1>
        <p className="payment-order-number">
          Order {order.orderNumber}
        </p>

        <div className="payment-grid">
          {/* ─── Left Column: Order Summary ─── */}
          <div className="payment-summary-card">
            <h2 className="payment-summary-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              Order Summary
            </h2>

            {/* Items */}
            <div>
              {order.items.map((item, i) => (
                <div key={i} className="payment-item-row">
                  <div className="payment-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.title} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    )}
                  </div>
                  <div className="payment-item-details">
                    <div className="payment-item-title">{item.title}</div>
                    <div className="payment-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <div className="payment-item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="payment-totals">
              <div className="payment-total-row">
                <span className="payment-total-label">Subtotal</span>
                <span className="payment-total-value">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="payment-total-row">
                <span className="payment-total-label">Shipping</span>
                <span className="payment-total-value free">Free</span>
              </div>
              <div className="payment-grand-total">
                <span className="payment-grand-total-label">Total</span>
                <span className="payment-grand-total-value">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Payment Action ─── */}
          <div className="payment-action-card">
            <h2 className="payment-action-heading">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              Payment
            </h2>

            {/* Payment Status */}
            <div style={{ marginBottom: '16px' }}>
              <span className={`payment-status-badge ${isAlreadyPaid ? 'paid' : 'pending'}`}>
                <span className={`payment-status-dot ${isAlreadyPaid ? 'paid' : 'pending'}`} />
                {isAlreadyPaid ? 'Paid' : 'Payment Pending'}
              </span>
            </div>

            {isAlreadyPaid ? (
              /* ── Already paid ── */
              <div className="payment-paid-banner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px', display: 'block' }}>
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p>This order has been paid</p>
                <p className="sub">No further action needed</p>
              </div>
            ) : paymentState === 'success' && paymentData ? (
              /* ── Success state ── */
              <div className="payment-success-card">
                <div className="payment-success-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="payment-success-title">Demo Payment Ready</div>
                <div className="payment-success-subtitle">
                  Choose a demo outcome to complete the checkout flow.
                </div>
                <div>
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Intent ID</span>
                    <span className="payment-detail-value">
                      {paymentData.paymentIntentId.slice(0, 20)}…
                    </span>
                  </div>
                  <div className="payment-detail-row">
                    <span className="payment-detail-label">Payment ID</span>
                    <span className="payment-detail-value">
                      {paymentData.paymentId}
                    </span>
                  </div>
                <div className="payment-detail-row">
                    <span className="payment-detail-label">Status</span>
                    <span className="payment-detail-value" style={{ color: '#fbbf24' }}>
                      Awaiting confirmation
                    </span>
                  </div>
                </div>

                {/* Navigation to result pages */}
                <div className="payment-sim-actions">
                  <button
                    onClick={() => handleSimulatePayment('success')}
                    disabled={simulating}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#fff',
                      background: 'rgba(52, 211, 153, 0.2)',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                      borderRadius: '8px',
                      cursor: simulating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: simulating ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { if (!simulating) e.target.style.background = 'rgba(52, 211, 153, 0.3)' }}
                    onMouseLeave={(e) => { if (!simulating) e.target.style.background = 'rgba(52, 211, 153, 0.2)' }}
                  >
                    {simulating ? 'Processing...' : 'Mark as Paid'}
                  </button>
                  <button
                    onClick={() => handleSimulatePayment('failed')}
                    disabled={simulating}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#fff',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      cursor: simulating ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: simulating ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => { if (!simulating) e.target.style.background = 'rgba(239, 68, 68, 0.25)' }}
                    onMouseLeave={(e) => { if (!simulating) e.target.style.background = 'rgba(239, 68, 68, 0.15)' }}
                  >
                    {simulating ? 'Processing...' : 'Mark as Failed'}
                  </button>
                </div>
              </div>
            ) : (
              /* ── Idle / Creating state ── */
              <>
                <div className="payment-card-placeholder">
                  <div className="payment-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                      <line x1="6" y1="15" x2="10" y2="15"/>
                      <line x1="14" y1="15" x2="18" y2="15"/>
                    </svg>
                  </div>
                  <div className="payment-card-text">
                    <strong>Demo checkout session</strong>
                    <br />
                    Create a mock payment intent to test checkout safely.
                  </div>
                </div>

                {paymentError && (
                  <div className="payment-error-msg">
                    {paymentError}
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            {!isAlreadyPaid && paymentState !== 'success' && (
              <button
                id="create-payment-intent-btn"
                className={`payment-create-btn ${paymentState === 'creating' ? 'creating' : ''}`}
                onClick={handleCreatePaymentIntent}
                disabled={paymentState === 'creating'}
              >
                {paymentState === 'creating' ? (
                  <>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'paymentSpin 0.7s linear infinite'
                    }} />
                    Preparing Demo Payment...
                  </>
                ) : paymentState === 'error' ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/>
                      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                    </svg>
                    Retry Demo Payment
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Create Demo Payment
                  </>
                )}
              </button>
            )}

            {paymentState === 'success' && (
              <Link to={`/orders/${order._id}`} className="payment-view-order-link">
                View Order Details →
              </Link>
            )}

            {!isAlreadyPaid && paymentState === 'idle' && (
              <Link to={`/orders/${order._id}`} className="payment-view-order-link">
                ← Back to Order
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentPage
