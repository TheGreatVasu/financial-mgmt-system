import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import { Loader2, Plus, Save, Trash2 } from 'lucide-react'

const MASTER_ROLES = [
  'Sales Manager',
  'Sales Head',
  'Business Head',
  'Collection Person Incharge',
  'Sales Agent',
  'Collection Agent'
]

const emptyContact = () => ({
  name: '',
  contactNumber: '',
  email: '',
  department: '',
  designation: '',
  jobRole: '',
  segment: ''
})

const emptyAddress = (label) => ({
  label,
  addressLine: '',
  city: '',
  state: '',
  pinCode: '',
  gstNumber: ''
})

const defaultPaymentTerm = () => ({
  title: '',
  type: 'Milestone Based',
  description: '',
  creditDays: 0,
  notes: ''
})

export default function CustomerNew() {
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])
  const navigate = useNavigate()

  const [companyProfile, setCompanyProfile] = useState({
    companyName: '',
    legalEntityName: '',
    corporateOffice: emptyAddress('Corporate Office'),
    marketingOffice: emptyAddress('Marketing Office'),
    correspondenceAddress: '',
    gstNumbers: [''],
    siteOffices: [emptyAddress('Site Office 1')],
    plantAddresses: [emptyAddress('Plant Address 1')],
    primaryContact: emptyContact()
  })

  const [customerProfile, setCustomerProfile] = useState({
    department: '',
    designation: '',
    jobRole: '',
    segment: '',
    contactPersonName: '',
    contactPersonNumber: '',
    emailId: ''
  })

  const [paymentTerms, setPaymentTerms] = useState([defaultPaymentTerm()])
  const [teamProfiles, setTeamProfiles] = useState(
    MASTER_ROLES.map((role) => ({ role, ...emptyContact() }))
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateCompany(field, value) {
    setCompanyProfile((prev) => ({ ...prev, [field]: value }))
  }

  function updateNestedAddress(listKey, index, field, value) {
    setCompanyProfile((prev) => {
      const nextList = prev[listKey].map((item, i) => (i === index ? { ...item, [field]: value } : item))
      return { ...prev, [listKey]: nextList }
    })
  }

  function addAddress(listKey, labelPrefix) {
    setCompanyProfile((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], emptyAddress(`${labelPrefix} ${prev[listKey].length + 1}`)]
    }))
  }

  function removeAddress(listKey, index) {
    setCompanyProfile((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index)
    }))
  }

  function updateGst(index, value) {
    setCompanyProfile((prev) => {
      const next = [...prev.gstNumbers]
      next[index] = value
      return { ...prev, gstNumbers: next }
    })
  }

  function addGstField() {
    setCompanyProfile((prev) => ({ ...prev, gstNumbers: [...prev.gstNumbers, ''] }))
  }

  function updatePaymentTerm(index, field, value) {
    setPaymentTerms((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addPaymentTerm() {
    setPaymentTerms((prev) => [...prev, defaultPaymentTerm()])
  }

  function removePaymentTerm(index) {
    setPaymentTerms((prev) => prev.filter((_, i) => i !== index))
  }

  function updateTeamProfile(index, field, value) {
    setTeamProfiles((prev) => prev.map((member, i) => (i === index ? { ...member, [field]: value } : member)))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!companyProfile.companyName?.trim() && !companyProfile.legalEntityName?.trim()) {
      setError('Company / legal entity name is required')
      return
    }
    if (customerProfile.emailId && !/^\S+@\S+\.\S+$/.test(customerProfile.emailId)) {
      setError('Please enter a valid email for customer profile')
      return
    }
    try {
      setSaving(true)
      const payload = {
        companyName: companyProfile.companyName || companyProfile.legalEntityName || null,
        name: customerProfile.contactPersonName || companyProfile.primaryContact.name || null,
        email: customerProfile.emailId || companyProfile.primaryContact.email || null,
        phone: customerProfile.contactPersonNumber || companyProfile.primaryContact.contactNumber || null,
        gstNumber:
          companyProfile.gstNumbers.find((gst) => gst?.trim()) ||
          companyProfile.corporateOffice.gstNumber ||
          null,
        metadata: {
          companyProfile,
          customerProfile,
          paymentTerms,
          teamProfiles
        }
      }
      const res = await svc.create(payload)
      const created = res?.data
      navigate(`/customers/${created?.id ?? created?._id ?? ''}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create master record')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Creation of Master Data</h1>
        <p className="text-sm text-secondary-600">
          Capture company, customer, payment, and sales hierarchy details in one place.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {/* Company Profile */}
        <section className="card">
          <div className="card-header">
          <div>
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Company Profile</h2>
              <p className="text-sm text-secondary-600 mt-1">
                Legal entity details, offices, GST numbers, and corporate contacts.
              </p>
            </div>
          </div>
          <div className="card-content space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Company Name *</label>
                <input
                  className="input"
                  value={companyProfile.companyName}
                  onChange={(e) => updateCompany('companyName', e.target.value)}
                  placeholder="Company trading name"
                />
              </div>
              <div>
                <label className="form-label">Legal Entity Name *</label>
                <input
                  className="input"
                  value={companyProfile.legalEntityName}
                  onChange={(e) => updateCompany('legalEntityName', e.target.value)}
                  placeholder="Registered legal entity"
                />
              </div>
              <div>
                <label className="form-label">Corporate Office Address</label>
                <textarea
                  className="input min-h-[90px]"
                  value={companyProfile.corporateOffice.addressLine}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      corporateOffice: { ...prev.corporateOffice, addressLine: e.target.value }
                    }))
                  }
                  placeholder="Full address, GST No, contact numbers"
                />
              </div>
              <div>
                <label className="form-label">Marketing Office</label>
                <textarea
                  className="input min-h-[90px]"
                  value={companyProfile.marketingOffice.addressLine}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      marketingOffice: { ...prev.marketingOffice, addressLine: e.target.value }
                    }))
                  }
                  placeholder="Address and contact details"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Site Offices & GST</label>
              <div className="space-y-4">
                {companyProfile.siteOffices.map((site, index) => (
                  <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-800">{site.label}</span>
                      {companyProfile.siteOffices.length > 1 && (
                        <button
                          type="button"
                          className="text-danger-600 hover:text-danger-700 text-xs"
                          onClick={() => removeAddress('siteOffices', index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      className="input min-h-[80px]"
                      value={site.addressLine}
                      onChange={(e) => updateNestedAddress('siteOffices', index, 'addressLine', e.target.value)}
                      placeholder="Address with GST"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder="GST Number"
                        value={site.gstNumber}
                        onChange={(e) =>
                          updateNestedAddress('siteOffices', index, 'gstNumber', e.target.value)
                        }
                      />
                      <input
                        className="input"
                        placeholder="Contact Number"
                        value={site.contactNumber || ''}
                        onChange={(e) =>
                          updateNestedAddress('siteOffices', index, 'contactNumber', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm inline-flex items-center gap-2"
                  onClick={() => addAddress('siteOffices', 'Site Office')}
                >
                  <Plus className="h-4 w-4" />
                  Add Site Office
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Plant Addresses</label>
              <div className="space-y-4">
                {companyProfile.plantAddresses.map((plant, index) => (
                  <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-secondary-800">{plant.label}</span>
                      {companyProfile.plantAddresses.length > 1 && (
                        <button
                          type="button"
                          className="text-danger-600 hover:text-danger-700 text-xs"
                          onClick={() => removeAddress('plantAddresses', index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      className="input min-h-[80px]"
                      value={plant.addressLine}
                      onChange={(e) =>
                        updateNestedAddress('plantAddresses', index, 'addressLine', e.target.value)
                      }
                      placeholder="Address and GST"
                    />
                    <input
                      className="input"
                      placeholder="GST Number"
                      value={plant.gstNumber}
                      onChange={(e) =>
                        updateNestedAddress('plantAddresses', index, 'gstNumber', e.target.value)
                      }
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline btn-sm inline-flex items-center gap-2"
                  onClick={() => addAddress('plantAddresses', 'Plant Address')}
                >
                  <Plus className="h-4 w-4" />
                  Add Plant Address
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">GST Numbers</label>
              <div className="grid gap-3">
                {companyProfile.gstNumbers.map((gst, index) => (
                  <input
                    key={index}
                    className="input"
                    placeholder={`GST No ${index + 1}`}
                    value={gst}
                    onChange={(e) => updateGst(index, e.target.value)}
                  />
                ))}
                <button type="button" className="btn btn-outline btn-sm w-fit" onClick={addGstField}>
                  Add GST No
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                <label className="form-label">Primary Contact Person</label>
                <input
                  className="input mb-2"
                  placeholder="Name"
                  value={companyProfile.primaryContact.name}
                  onChange={(e) =>
                    updateCompany('primaryContact', {
                      ...companyProfile.primaryContact,
                      name: e.target.value
                    })
                  }
                />
                <input
                  className="input mb-2"
                  placeholder="Contact Number"
                  value={companyProfile.primaryContact.contactNumber}
                  onChange={(e) =>
                    updateCompany('primaryContact', {
                      ...companyProfile.primaryContact,
                      contactNumber: e.target.value
                    })
                  }
                />
                <input
                  className="input"
                  placeholder="Email ID"
                  value={companyProfile.primaryContact.email}
                  onChange={(e) =>
                    updateCompany('primaryContact', {
                      ...companyProfile.primaryContact,
                      email: e.target.value
                    })
                  }
                />
          </div>
          <div>
                <label className="form-label">Correspondence Address</label>
                <textarea
                  className="input min-h-[120px]"
                  value={companyProfile.correspondenceAddress}
                  onChange={(e) => updateCompany('correspondenceAddress', e.target.value)}
                  placeholder="Postal address for official communication"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customer Profile */}
        <section className="card">
          <div className="card-header">
          <div>
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Customer Profile</h2>
              <p className="text-sm text-secondary-600 mt-1">
                Department, designation, job roles, and communication preferences.
              </p>
            </div>
          </div>
          <div className="card-content grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Contact Person Name</label>
              <input
                className="input"
                value={customerProfile.contactPersonName}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, contactPersonName: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input
                className="input"
                value={customerProfile.contactPersonNumber}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, contactPersonNumber: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Email ID</label>
              <input
                className="input"
                type="email"
                value={customerProfile.emailId}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, emailId: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Department</label>
              <input
                className="input"
                value={customerProfile.department}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, department: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="form-label">Designation</label>
              <input
                className="input"
                value={customerProfile.designation}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, designation: e.target.value }))
                }
              />
          </div>
          <div>
              <label className="form-label">Job Role</label>
              <input
                className="input"
                value={customerProfile.jobRole}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, jobRole: e.target.value }))
                }
              />
          </div>
          <div>
              <label className="form-label">Segment</label>
              <input
                className="input"
                value={customerProfile.segment}
                onChange={(e) =>
                  setCustomerProfile((prev) => ({ ...prev, segment: e.target.value }))
                }
              />
            </div>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">Creation of Payment Terms</h2>
              <p className="text-sm text-secondary-600 mt-1">
                Define standard and customer-specific payment term templates.
              </p>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={addPaymentTerm}>
              <Plus className="h-4 w-4 mr-1" />
              Add Term
            </button>
          </div>
          <div className="card-content space-y-4">
            {paymentTerms.map((term, index) => (
              <div key={index} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary-800">
                    Payment Term {index + 1}
                  </span>
                  {paymentTerms.length > 1 && (
                    <button
                      type="button"
                      className="text-danger-600 hover:text-danger-700 text-xs inline-flex items-center gap-1"
                      onClick={() => removePaymentTerm(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="Term Title (e.g., Advance 10%)"
                    value={term.title}
                    onChange={(e) => updatePaymentTerm(index, 'title', e.target.value)}
                  />
                  <select
                    className="input"
                    value={term.type}
                    onChange={(e) => updatePaymentTerm(index, 'type', e.target.value)}
                  >
                    <option>Milestone Based</option>
                    <option>Percentage Based</option>
                    <option>Credit Days</option>
                    <option>Retention</option>
                    <option>Custom</option>
                  </select>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    placeholder="Credit Days"
                    value={term.creditDays}
                    onChange={(e) => updatePaymentTerm(index, 'creditDays', Number(e.target.value))}
                  />
                  <input
                    className="input"
                    placeholder="Applicable Segment / Dept."
                    value={term.applicableFor || ''}
                    onChange={(e) => updatePaymentTerm(index, 'applicableFor', e.target.value)}
                  />
                </div>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Notes / description / milestones"
                  value={term.description}
                  onChange={(e) => updatePaymentTerm(index, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Sales & Collection Team */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2 className="text-lg font-semibold text-secondary-900">
                Sales / Collection Master Profiles
              </h2>
              <p className="text-sm text-secondary-600 mt-1">
                Capture profiles for Sales Manager, Business Head, Agents, and Collection teams.
              </p>
            </div>
          </div>
          <div className="card-content grid grid-cols-1 lg:grid-cols-2 gap-4">
            {teamProfiles.map((member, index) => (
              <div key={member.role} className="rounded-lg border border-secondary-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-secondary-800">{member.role}</span>
                </div>
                <input
                  className="input"
                  placeholder="Full Name"
                  value={member.name}
                  onChange={(e) => updateTeamProfile(index, 'name', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Contact Number"
                  value={member.contactNumber}
                  onChange={(e) => updateTeamProfile(index, 'contactNumber', e.target.value)}
                />
                <input
                  className="input"
                  placeholder="Email ID"
                  value={member.email}
                  onChange={(e) => updateTeamProfile(index, 'email', e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className="input"
                    placeholder="Department"
                    value={member.department}
                    onChange={(e) => updateTeamProfile(index, 'department', e.target.value)}
                  />
                  <input
                    className="input"
                    placeholder="Designation / Job Role"
                    value={member.designation}
                    onChange={(e) => updateTeamProfile(index, 'designation', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-secondary-200 pt-4">
          <p className="text-xs text-secondary-500 flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-success-500" />
            Autosave coming soon — for now ensure all mandatory sections are filled before submitting.
          </p>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 px-8 py-3 text-base font-semibold text-white shadow-[0_15px_30px_-10px_rgba(15,23,42,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_25px_45px_-15px_rgba(15,23,42,0.55)] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving master data...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Master Data
              </>
            )}
            </button>
          </div>
        </form>
    </DashboardLayout>
  )
}

