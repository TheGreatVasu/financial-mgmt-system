import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../context/AuthContext.jsx'
import { cancelSubscription, changePlan, fetchSubscription, resumeSubscription, updatePaymentMethod } from '../services/subscriptionService'

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-secondary-200/70 bg-white p-4">
      <div className="text-xs text-secondary-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {hint ? <div className="mt-0.5 text-xs text-secondary-500">{hint}</div> : null}
    </div>
  )
}

function PlanCard({ plan, current, onSelect }) {
  const isCurrent = current?.id === plan.id
  return (
    <div className={`rounded-xl border ${plan.popular ? 'border-blue-300' : 'border-secondary-200/70'} bg-white p-5 shadow-sm relative`}>
      {plan.popular && (
        <div className="absolute -top-2 right-4 rounded-full bg-blue-600 px-2.5 py-1 text-xs font-medium text-white shadow">Most popular</div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-secondary-500">Plan</div>
          <div className="mt-0.5 text-xl font-semibold">{plan.name}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{plan.price === 0 ? 'Free' : `₹${plan.price}`}</div>
          <div className="text-xs text-secondary-500">{plan.price === 0 ? '' : `per ${plan.interval}`}</div>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-secondary-700 list-disc ml-5">
        {plan.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="mt-5">
        {isCurrent ? (
          <button className="btn btn-secondary btn-sm" disabled>
            Current plan
          </button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => onSelect(plan.id)}>
            Choose {plan.name}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Subscription() {
  const { token, user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState({ subscription: null, catalog: [] })
  const sub = data.subscription

  useEffect(() => {
    let mounted = true
    async function run() {
      setLoading(true)
      const res = await fetchSubscription(token)
      if (mounted) setData(res)
      setLoading(false)
    }
    run()
    return () => { mounted = false }
  }, [token])

  const usagePct = useMemo(() => {
    if (!sub) return 0
    const used = sub.usage.storageGb
    const limit = sub.usage.storageLimitGb
    return Math.min(100, Math.round((used / limit) * 100))
  }, [sub])

  async function onPickPlan(planId) {
    setSaving(true)
    const res = await changePlan(token, planId)
    setData(res)
    setSaving(false)
  }

  async function onCancel() {
    setSaving(true)
    const res = await cancelSubscription(token)
    setData(res)
    setSaving(false)
  }

  async function onResume() {
    setSaving(true)
    const res = await resumeSubscription(token)
    setData(res)
    setSaving(false)
  }

  async function onUpdatePm() {
    setSaving(true)
    const res = await updatePaymentMethod(token)
    setData(res)
    setSaving(false)
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Subscription</h1>
        <p className="text-sm text-secondary-600 mt-1">Manage your plan and billing</p>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-secondary-600">Loading subscription…</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="text-sm text-secondary-500">Current Plan</div>
                  <div className="mt-0.5 text-2xl font-semibold">{sub?.currentPlan?.name}</div>
                  <div className="mt-1 text-sm text-secondary-600">Renews {new Date(sub?.billing?.renewsAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold">{sub?.currentPlan?.price === 0 ? 'Free' : `₹${sub?.currentPlan?.price}`}</div>
                  <div className="text-xs text-secondary-500">{sub?.currentPlan?.price === 0 ? '' : `per ${sub?.currentPlan?.interval}`}</div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="Storage" value={`${sub?.usage?.storageGb} / ${sub?.usage?.storageLimitGb} GB`} hint={`${usagePct}% used`} />
                <Stat label="Invoices this month" value={`${sub?.usage?.invoicesThisMonth}`} hint={`Limit ${sub?.usage?.invoiceLimit}`} />
                <Stat label="Billing status" value={sub?.billing?.status.replaceAll('_',' ')} />
                <Stat label="Account" value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()} />
              </div>

              <div className="mt-6 h-2 w-full rounded bg-secondary-100">
                <div className="h-2 rounded bg-blue-600" style={{ width: `${usagePct}%` }} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {sub?.billing?.status === 'active' ? (
                  <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={saving}>Cancel at period end</button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={onResume} disabled={saving}>Resume subscription</button>
                )}
                <button className="btn btn-outline btn-sm" onClick={onUpdatePm} disabled={saving}>
                  Update payment method
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-secondary-600 mb-3">Choose a plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.catalog.map((p) => (
                  <PlanCard key={p.id} plan={p} current={sub?.currentPlan} onSelect={onPickPlan} />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium">Payment method</div>
              <div className="mt-2 text-sm text-secondary-600 flex items-center justify-between">
                <div>
                  <div>{sub?.billing?.paymentMethod?.brand} •••• {sub?.billing?.paymentMethod?.last4}</div>
                  <div className="text-xs">Exp {sub?.billing?.paymentMethod?.expires}</div>
                </div>
                <button className="btn btn-outline btn-sm" onClick={onUpdatePm} disabled={saving}>Update</button>
              </div>
            </div>

            <div className="rounded-xl border border-secondary-200/70 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium">Included features</div>
              <ul className="mt-3 space-y-2 text-sm text-secondary-700 list-disc ml-5">
                {(sub?.currentPlan?.features || []).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </DashboardLayout>
  )
}

