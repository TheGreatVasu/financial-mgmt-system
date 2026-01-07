import React, { useMemo, useState, useEffect, useCallback, useRef, useReducer } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createCustomerService } from '../../services/customerService'
import masterDataService from '../../services/masterDataService'
import SelectWithOther from '../../components/ui/SelectWithOther.jsx'
import { Loader2, Plus, Save, Trash2, CheckCircle2, XCircle, Building2, Users, FileText, CreditCard, UserCheck, ArrowLeft } from 'lucide-react'
import ErrorBoundary from '../../components/ui/ErrorBoundary.jsx'
import Modal from '../../components/ui/Modal.jsx'
import toast from 'react-hot-toast'

// --- CONSTANTS & HELPERS ---

const DEV_BYPASS_VALIDATION = false

const MASTER_ROLES = [
  'Sales Manager', 'Sales Head', 'Business Head', 'Collection Incharge',
  'Sales Agent', 'Collection Agent', 'Project Manager', 'Project Head'
]

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
  "Lakshadweep", "Puducherry"
];

const STEPS = [
  { id: 1, label: 'Company Profile', icon: Building2 },
  { id: 2, label: 'Customer Profile', icon: Users },
  { id: 3, label: 'Consignee Profile', icon: FileText },
  { id: 4, label: 'Payer Profile', icon: CreditCard },
  { id: 5, label: 'Payment Terms', icon: FileText },
  { id: 6, label: 'Team Profiles', icon: UserCheck }
]

// Data Factory Functions
function defaultPaymentTerm() {
  return { title: '', type: '', creditDays: '', applicableFor: '', description: '', basic: '', freight: '', taxes: '', due1: '', due2: '', due3: '', finalDue: '' }
}
function emptyContact() {
  return { name: '', email: '', contactNumber: '', department: '', designation: '', jobRole: '', segment: '', photo: null }
}
function emptyAddress(label = 'Address') {
  return { label: label, addressLine: '', contactNumber: '', gstNumber: '' }
}
function emptyConsignee() {
  return { logo: null, consigneeName: '', consigneeAddress: '', customerName: '', legalEntityName: '', city: '', state: '', gstNumber: '', contactPersonName: '', designation: '', contactNumber: '', emailId: '' }
}
function emptyPayer() {
  return { logo: null, payerName: '', payerAddress: '', customerName: '', legalEntityName: '', city: '', state: '', gstNumber: '', contactPersonName: '', designation: '', contactNumber: '', emailId: '' }
}
const createDefaultCompanyProfile = () => ({
  logo: null, companyName: '', legalEntityName: '', corporateAddress: '', corporateDistrict: '', corporateState: '', corporateCountry: 'India', corporatePinCode: '',
  correspondenceAddress: '', correspondenceDistrict: '', correspondenceState: '', correspondenceCountry: 'India', correspondencePinCode: '',
  otherOfficeType: '', otherOfficeAddress: '', otherOfficeGst: '', otherOfficeDistrict: '', otherOfficeState: '', otherOfficeCountry: 'India', otherOfficePinCode: '',
  otherOfficeContactName: '', otherOfficeContactNumber: '', otherOfficeEmail: '',
  siteOffices: [emptyAddress('Site Office 1')],
  primaryContact: emptyContact()
})
const createDefaultCustomerProfile = () => ({
  logo: null, customerName: '', legalEntityName: '', corporateOfficeAddress: '', correspondenceAddress: '', district: '', state: '', country: 'India', pinCode: '',
  segment: '', gstNumber: '', poIssuingAuthority: '', designation: '', contactNumber: '', emailId: ''
})

// --- REDUCER STATE MANAGEMENT ---

const initialState = {
  companyProfile: createDefaultCompanyProfile(),
  customerProfile: createDefaultCustomerProfile(),
  consigneeProfiles: [emptyConsignee()],
  payerProfiles: [emptyPayer()],
  paymentTerms: [defaultPaymentTerm()],
  teamProfiles: [{ role: MASTER_ROLES[0], ...emptyContact() }],
  previews: { logo: null, customerLogo: null, consignee: {}, payer: {}, employee: {} }
}

function formReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload }
    
    // Generic Field Updates
    case 'UPDATE_COMPANY':
      return { ...state, companyProfile: { ...state.companyProfile, [action.field]: action.value } }
    case 'UPDATE_COMPANY_CONTACT':
      return { ...state, companyProfile: { ...state.companyProfile, primaryContact: { ...state.companyProfile.primaryContact, [action.field]: action.value } } }
    case 'UPDATE_CUSTOMER':
      return { ...state, customerProfile: { ...state.customerProfile, [action.field]: action.value } }
    
    // Array Item Updates
    case 'UPDATE_ARRAY_ITEM': {
      const { section, index, field, value } = action
      const list = [...state[section]]
      list[index] = { ...list[index], [field]: value }
      return { ...state, [section]: list }
    }
    case 'ADD_ARRAY_ITEM':
      return { ...state, [action.section]: [...state[action.section], action.item] }
    case 'REMOVE_ARRAY_ITEM':
      return { ...state, [action.section]: state[action.section].filter((_, i) => i !== action.index) }

    // Specific logic for Site Offices
    case 'UPDATE_SITE_OFFICE': {
      const { index, field, value } = action
      const newOffices = [...(state.companyProfile.siteOffices || [])]
      newOffices[index] = { ...newOffices[index], [field]: value }
      return { ...state, companyProfile: { ...state.companyProfile, siteOffices: newOffices } }
    }
    case 'ADD_SITE_OFFICE': {
      const current = state.companyProfile.siteOffices || []
      return { ...state, companyProfile: { ...state.companyProfile, siteOffices: [...current, emptyAddress(`Site Office ${current.length + 1}`)] } }
    }
    case 'REMOVE_SITE_OFFICE': {
      const filtered = (state.companyProfile.siteOffices || []).filter((_, i) => i !== action.index)
      return { ...state, companyProfile: { ...state.companyProfile, siteOffices: filtered.length ? filtered : [emptyAddress('Site Office 1')] } }
    }

    // Preview Logic
    case 'SET_PREVIEW': {
      const { category, index, url } = action
      if (index !== undefined) {
        return { ...state, previews: { ...state.previews, [category]: { ...state.previews[category], [index]: url } } }
      }
      return { ...state, previews: { ...state.previews, [category]: url } }
    }

    default:
      return state
  }
}

// --- VALIDATION LOGIC ---

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return false;

  // This regex allows any standard email format: localpart@domain.extension
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(trimmedEmail);
}

function validatePhone(phone) {
  return /^\+?\d{10,12}$/.test(phone || '')
}

function getStepValidation(step, state) {
  const errors = {}
  let isValid = true
  const setError = (key, msg) => { errors[key] = msg; isValid = false; }

  try {
    if (step === 0) {
      const req = ['companyName', 'legalEntityName', 'corporateAddress', 'corporateDistrict', 'corporateState', 'corporateCountry', 'corporatePinCode', 'correspondenceAddress', 'correspondenceDistrict', 'correspondenceState', 'correspondenceCountry', 'correspondencePinCode']
      req.forEach(f => { if (!state.companyProfile?.[f]?.trim()) setError(`company.${f}`, `${f} is required`) })
      
      const contact = state.companyProfile.primaryContact
      if (contact?.email && !validateEmail(contact.email)) setError('company.primaryContact.email', 'Invalid Email (use @financialmgmt.com)')
      if (contact?.contactNumber && !validatePhone(contact.contactNumber)) setError('company.primaryContact.contactNumber', 'Invalid Phone (digits only)')
    }

    if (step === 1) {
      const req = ['customerName', 'legalEntityName', 'corporateOfficeAddress', 'correspondenceAddress', 'district', 'state', 'country', 'pinCode', 'segment', 'gstNumber', 'poIssuingAuthority', 'designation', 'contactNumber', 'emailId']
      req.forEach(f => { if (!state.customerProfile?.[f]?.trim()) setError(`customer.${f}`, `${f} is required`) })
      
      if (state.customerProfile.emailId && !validateEmail(state.customerProfile.emailId)) setError('customer.emailId', 'Invalid Email')
      if (state.customerProfile.contactNumber && !validatePhone(state.customerProfile.contactNumber)) setError('customer.contactNumber', 'Invalid Phone')
    }

    if (step === 2) {
      state.consigneeProfiles.forEach((item, idx) => {
        const req = ['consigneeName', 'consigneeAddress', 'customerName', 'legalEntityName', 'city', 'state', 'gstNumber', 'contactPersonName', 'designation', 'contactNumber', 'emailId']
        req.forEach(f => { if (!item?.[f]?.trim()) setError(`consignee.${idx}.${f}`, `${f} is required`) })
        if (item.emailId && !validateEmail(item.emailId)) setError(`consignee.${idx}.emailId`, 'Invalid Email')
        if (item.contactNumber && !validatePhone(item.contactNumber)) setError(`consignee.${idx}.contactNumber`, 'Invalid Phone')
      })
    }

    if (step === 3) {
      state.payerProfiles.forEach((item, idx) => {
        const req = ['payerName', 'payerAddress', 'customerName', 'legalEntityName', 'city', 'state', 'gstNumber', 'contactPersonName', 'designation', 'contactNumber', 'emailId']
        req.forEach(f => { if (!item?.[f]?.trim()) setError(`payer.${idx}.${f}`, `${f} is required`) })
        if (item.emailId && !validateEmail(item.emailId)) setError(`payer.${idx}.emailId`, 'Invalid Email')
        if (item.contactNumber && !validatePhone(item.contactNumber)) setError(`payer.${idx}.contactNumber`, 'Invalid Phone')
      })
    }

    if (step === 4) {
      state.teamProfiles.forEach((item, idx) => {
        if (item.email && !validateEmail(item.email)) setError(`team.${idx}.email`, 'Invalid Email')
        if (item.contactNumber && !validatePhone(item.contactNumber)) setError(`team.${idx}.contactNumber`, 'Invalid Phone')
      })
    }
  } catch (err) { console.error(err); isValid = false; }

  return { isValid, errors }
}

// --- MEMOIZED STEP COMPONENTS ---

const Step1Company = React.memo(({ data, dispatch, errors, preview }) => {
  const getErr = (f) => errors[`company.${f}`]
  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      dispatch({ type: 'UPDATE_COMPANY', field: 'logo', value: file })
      const reader = new FileReader(); reader.onloadend = () => dispatch({ type: 'SET_PREVIEW', category: 'logo', url: reader.result }); reader.readAsDataURL(file);
    }
  }

  return (
    <section className="card">
      <div className="card-header"><h2 className="text-lg font-semibold text-secondary-900">Creation of Company Profile</h2></div>
      <div className="card-content space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="form-label">Company Logo</label>
            <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                {preview ? <img src={preview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-primary-700 text-lg font-semibold">{data.logo?.name?.substring(0,2).toUpperCase() || 'Logo'}</span>}
              </div>
              <label className="btn btn-primary btn-sm cursor-pointer">
                {preview ? 'Change Logo' : 'Choose File'}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </label>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Company Name *</label>
              <input className={`input ${getErr('companyName') ? 'border-red-500' : ''}`} value={data.companyName || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'companyName', value: e.target.value })} placeholder="Company trading name" />
              {getErr('companyName') && <p className="text-xs text-red-500 mt-1">{getErr('companyName')}</p>}
            </div>
            <div>
              <label className="form-label">Legal Entity Name *</label>
              <input className="input" value={data.legalEntityName || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'legalEntityName', value: e.target.value })} placeholder="Registered legal entity" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="form-label">Corporate Office Address *</label>
            <textarea className="input min-h-[90px]" value={data.corporateAddress || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'corporateAddress', value: e.target.value })} placeholder="Full address" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className="input" value={data.corporateCountry || 'India'} disabled>
                <option value="India">India</option>
              </select>
              <select className="input" value={data.corporateState || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'corporateState', value: e.target.value })}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="District/City *" value={data.corporateDistrict || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'corporateDistrict', value: e.target.value })} />
              <input className="input" placeholder="Pin Code *" value={data.corporatePinCode || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'corporatePinCode', value: e.target.value })} />
            </div>
          </div>
          <div className="space-y-3">
            <label className="form-label">Correspondence Address *</label>
            <textarea className="input min-h-[90px]" value={data.correspondenceAddress || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'correspondenceAddress', value: e.target.value })} placeholder="Postal address" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select className="input" value={data.correspondenceCountry || 'India'} disabled>
                <option value="India">India</option>
              </select>
              <select className="input" value={data.correspondenceState || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'correspondenceState', value: e.target.value })}>
                <option value="">Select State</option>
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="input" placeholder="District/City *" value={data.correspondenceDistrict || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'correspondenceDistrict', value: e.target.value })} />
              <input className="input" placeholder="Pin Code *" value={data.correspondencePinCode || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY', field: 'correspondencePinCode', value: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
           <label className="form-label">Other Office / Plant Details</label>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectWithOther className="input" value={data.otherOfficeType || ''} onChange={(val) => dispatch({ type: 'UPDATE_COMPANY', field: 'otherOfficeType', value: val })} options={[{ value: 'Plant Address', label: 'Plant Address' }, { value: 'Site Office', label: 'Site Office' }]} placeholder="Select type" otherLabel="Other" otherInputPlaceholder="Enter type" />
              <div className="col-span-3">
                {(data.siteOffices || []).map((addr, idx) => (
                  <div key={idx} className="rounded-lg border border-secondary-200 p-3 mb-3">
                    <div className="flex justify-between mb-2">
                      <div className="text-sm font-medium">{addr.label}</div>
                      <button type="button" className="text-xs text-danger-600" onClick={() => dispatch({ type: 'REMOVE_SITE_OFFICE', index: idx })}>Remove</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="input" placeholder="Address" value={addr.addressLine || ''} onChange={(e) => dispatch({ type: 'UPDATE_SITE_OFFICE', index: idx, field: 'addressLine', value: e.target.value })} />
                      <input className="input" placeholder="Contact No" value={addr.contactNumber || ''} onChange={(e) => dispatch({ type: 'UPDATE_SITE_OFFICE', index: idx, field: 'contactNumber', value: e.target.value })} />
                      <input className="input" placeholder="GST No" value={addr.gstNumber || ''} onChange={(e) => dispatch({ type: 'UPDATE_SITE_OFFICE', index: idx, field: 'gstNumber', value: e.target.value })} />
                      <input className="input" placeholder="Label" value={addr.label || ''} onChange={(e) => dispatch({ type: 'UPDATE_SITE_OFFICE', index: idx, field: 'label', value: e.target.value })} />
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'ADD_SITE_OFFICE' })}>Add</button>
              </div>
           </div>
        </div>

        <div className="space-y-3 mt-6 pt-6 border-t border-secondary-200">
          <h3 className="text-base font-semibold text-secondary-900">Primary Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
                <label className="form-label">Contact Name</label>
                <input className="input" placeholder="Contact person name" value={data.primaryContact?.name || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY_CONTACT', field: 'name', value: e.target.value })} />
             </div>
             <div>
                <label className="form-label">Contact Number</label>
                <input className={`input ${getErr('primaryContact.contactNumber') ? 'border-red-500' : ''}`} placeholder="Contact number" value={data.primaryContact?.contactNumber || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY_CONTACT', field: 'contactNumber', value: e.target.value })} />
             </div>
             <div>
                <label className="form-label">Email ID</label>
                <input className={`input ${getErr('primaryContact.email') ? 'border-red-500' : ''}`} placeholder="Email address" value={data.primaryContact?.email || ''} onChange={(e) => dispatch({ type: 'UPDATE_COMPANY_CONTACT', field: 'email', value: e.target.value })} />
             </div>
          </div>
        </div>
      </div>
    </section>
  )
})

const Step2Customer = React.memo(({ data, dispatch, errors, preview }) => {
  const getErr = (f) => errors[`customer.${f}`]
  const handleLogo = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      dispatch({ type: 'UPDATE_CUSTOMER', field: 'logo', value: file })
      const reader = new FileReader(); reader.onloadend = () => dispatch({ type: 'SET_PREVIEW', category: 'customerLogo', url: reader.result }); reader.readAsDataURL(file);
    }
  }

  return (
    <section className="card">
      <div className="card-header"><h2 className="text-lg font-semibold text-secondary-900">Creation of Customer Profile</h2></div>
      <div className="card-content space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
             <label className="form-label">Logo</label>
             <div className="rounded-lg border border-dashed border-secondary-300 bg-white p-4 text-center space-y-3">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-50 overflow-hidden">
                  {preview ? <img src={preview} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-primary-700 font-semibold">{data.logo?.name?.substring(0,2) || 'Logo'}</span>}
                </div>
                <label className="btn btn-outline btn-sm cursor-pointer">
                  {preview ? 'Change Logo' : 'Choose File'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </label>
             </div>
           </div>
           <div><label className="form-label">Customer Name *</label><input className={`input ${getErr('customerName')?'border-red-500':''}`} value={data.customerName||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'customerName',value:e.target.value})} placeholder="Enter customer name"/>{getErr('customerName')&&<p className="text-xs text-red-500">{getErr('customerName')}</p>}</div>
           <div><label className="form-label">Legal Entity Name *</label><input className="input" value={data.legalEntityName||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'legalEntityName',value:e.target.value})} placeholder="Enter legal entity name"/></div>
           <div><label className="form-label">Corporate Office Address *</label><textarea className="input min-h-[80px]" value={data.corporateOfficeAddress||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'corporateOfficeAddress',value:e.target.value})} placeholder="Enter address"/></div>
           <div><label className="form-label">Correspondence Address *</label><textarea className="input min-h-[80px]" value={data.correspondenceAddress||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'correspondenceAddress',value:e.target.value})} placeholder="Enter address"/></div>
           
           <div>
             <label className="form-label">Country *</label>
             <select className="input" value={data.country || 'India'} disabled>
               <option value="India">India</option>
             </select>
           </div>
           
           <div>
             <label className="form-label">State *</label>
             <select className="input" value={data.state || ''} onChange={(e) => dispatch({ type: 'UPDATE_CUSTOMER', field: 'state', value: e.target.value })}>
               <option value="">Select State</option>
               {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>

           <div><label className="form-label">District/City *</label><input className="input" value={data.district||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'district',value:e.target.value})}/></div>
           <div><label className="form-label">Pin Code *</label><input className="input" value={data.pinCode||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'pinCode',value:e.target.value})}/></div>
           <div><label className="form-label">Segment *</label><SelectWithOther className="input" value={data.segment||''} onChange={(v)=>dispatch({type:'UPDATE_CUSTOMER',field:'segment',value:v})} options={[{value:'Domestic',label:'Domestic'},{value:'Export',label:'Export'}]} placeholder="Select segment"/></div>
           <div><label className="form-label">GST No *</label><input className="input" value={data.gstNumber||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'gstNumber',value:e.target.value})}/></div>
           <div><label className="form-label">PO Authority *</label><input className="input" value={data.poIssuingAuthority||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'poIssuingAuthority',value:e.target.value})}/></div>
           <div><label className="form-label">Designation *</label><input className="input" value={data.designation||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'designation',value:e.target.value})}/></div>
           <div><label className="form-label">Contact No *</label><input className={`input ${getErr('contactNumber')?'border-red-500':''}`} value={data.contactNumber||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'contactNumber',value:e.target.value})}/></div>
           <div><label className="form-label">Email ID *</label><input className={`input ${getErr('emailId')?'border-red-500':''}`} value={data.emailId||''} onChange={(e)=>dispatch({type:'UPDATE_CUSTOMER',field:'emailId',value:e.target.value})}/></div>
        </div>
      </div>
    </section>
  )
})

const Step3Consignee = React.memo(({ list, dispatch, errors, previews }) => {
  return (
    <section className="card">
      <div className="card-header flex justify-between"><h2 className="text-lg font-semibold">Creation of Consignee Profile</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'ADD_ARRAY_ITEM', section: 'consigneeProfiles', item: emptyConsignee() })}><Plus className="h-4 w-4"/> Add +</button></div>
      <div className="card-content space-y-4">
        {list.map((item, idx) => {
          const update = (field, val) => dispatch({ type: 'UPDATE_ARRAY_ITEM', section: 'consigneeProfiles', index: idx, field, value: val })
          const getErr = (f) => errors[`consignee.${idx}.${f}`]
          return (
            <div key={idx} className="rounded-lg border border-secondary-200 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="form-label">Consignee Name *</label><input className={`input ${getErr('consigneeName')?'border-red-500':''}`} value={item.consigneeName||''} onChange={(e)=>update('consigneeName',e.target.value)}/></div>
                <div className="md:col-span-2"><label className="form-label">Consignee Address *</label><textarea className="input min-h-[80px]" value={item.consigneeAddress||''} onChange={(e)=>update('consigneeAddress',e.target.value)}/></div>
                <div><label className="form-label">Customer Name *</label><input className="input" value={item.customerName||''} onChange={(e)=>update('customerName',e.target.value)}/></div>
                <div><label className="form-label">Legal Entity Name *</label><input className="input" value={item.legalEntityName||''} onChange={(e)=>update('legalEntityName',e.target.value)}/></div>
                
                <div>
                  <label className="form-label">State *</label>
                  <select className={`input ${getErr('state')?'border-red-500':''}`} value={item.state || ''} onChange={(e) => update('state', e.target.value)}>
                    <option value="">Select State</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="form-label">City *</label><input className={`input ${getErr('city')?'border-red-500':''}`} value={item.city||''} onChange={(e)=>update('city',e.target.value)}/></div>
                
                <div><label className="form-label">GST No *</label><input className={`input ${getErr('gstNumber')?'border-red-500':''}`} value={item.gstNumber||''} onChange={(e)=>update('gstNumber',e.target.value)}/></div>
                <div><label className="form-label">Contact Person *</label><input className="input" value={item.contactPersonName||''} onChange={(e)=>update('contactPersonName',e.target.value)}/></div>
                <div><label className="form-label">Designation *</label><input className="input" value={item.designation||''} onChange={(e)=>update('designation',e.target.value)}/></div>
                <div><label className="form-label">Contact No *</label><input className={`input ${getErr('contactNumber')?'border-red-500':''}`} value={item.contactNumber||''} onChange={(e)=>update('contactNumber',e.target.value)}/></div>
                <div><label className="form-label">Email ID *</label><input className={`input ${getErr('emailId')?'border-red-500':''}`} value={item.emailId||''} onChange={(e)=>update('emailId',e.target.value)}/></div>
              </div>
              {list.length > 1 && <button type="button" className="text-danger-600 text-xs" onClick={()=>dispatch({type:'REMOVE_ARRAY_ITEM',section:'consigneeProfiles',index:idx})}>Remove</button>}
            </div>
          )
        })}
      </div>
    </section>
  )
})

const Step4Payer = React.memo(({ list, dispatch, errors, previews }) => {
  return (
    <section className="card">
      <div className="card-header flex justify-between"><h2 className="text-lg font-semibold">Creation of Payer Profile</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'ADD_ARRAY_ITEM', section: 'payerProfiles', item: emptyPayer() })}><Plus className="h-4 w-4"/> Add +</button></div>
      <div className="card-content space-y-4">
        {list.map((item, idx) => {
          const update = (field, val) => dispatch({ type: 'UPDATE_ARRAY_ITEM', section: 'payerProfiles', index: idx, field, value: val })
          const getErr = (f) => errors[`payer.${idx}.${f}`]
          return (
            <div key={idx} className="rounded-lg border border-secondary-200 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="form-label">Payer Name *</label><input className={`input ${getErr('payerName')?'border-red-500':''}`} value={item.payerName||''} onChange={(e)=>update('payerName',e.target.value)}/></div>
                 <div className="md:col-span-2"><label className="form-label">Address *</label><textarea className="input min-h-[80px]" value={item.payerAddress||''} onChange={(e)=>update('payerAddress',e.target.value)}/></div>
                 <div><label className="form-label">Customer Name *</label><input className="input" value={item.customerName||''} onChange={(e)=>update('customerName',e.target.value)}/></div>
                 <div><label className="form-label">Legal Entity *</label><input className="input" value={item.legalEntityName||''} onChange={(e)=>update('legalEntityName',e.target.value)}/></div>
                 
                 <div>
                   <label className="form-label">State *</label>
                   <select className="input" value={item.state || ''} onChange={(e) => update('state', e.target.value)}>
                     <option value="">Select State</option>
                     {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                 </div>
                 <div><label className="form-label">City *</label><input className="input" value={item.city||''} onChange={(e)=>update('city',e.target.value)}/></div>
                 
                 <div><label className="form-label">GST No *</label><input className="input" value={item.gstNumber||''} onChange={(e)=>update('gstNumber',e.target.value)}/></div>
                 <div><label className="form-label">Contact Person *</label><input className="input" value={item.contactPersonName||''} onChange={(e)=>update('contactPersonName',e.target.value)}/></div>
                 <div><label className="form-label">Designation *</label><input className="input" value={item.designation||''} onChange={(e)=>update('designation',e.target.value)}/></div>
                 <div><label className="form-label">Contact No *</label><input className={`input ${getErr('contactNumber')?'border-red-500':''}`} value={item.contactNumber||''} onChange={(e)=>update('contactNumber',e.target.value)}/></div>
                 <div><label className="form-label">Email ID *</label><input className={`input ${getErr('emailId')?'border-red-500':''}`} value={item.emailId||''} onChange={(e)=>update('emailId',e.target.value)}/></div>
              </div>
              {list.length > 1 && <button type="button" className="text-danger-600 text-xs" onClick={()=>dispatch({type:'REMOVE_ARRAY_ITEM',section:'payerProfiles',index:idx})}>Remove</button>}
            </div>
          )
        })}
      </div>
    </section>
  )
})

const Step5Team = React.memo(({ list, dispatch, errors, previews }) => {
  return (
    <section className="card">
      <div className="card-header flex justify-between"><h2 className="text-lg font-semibold">Creation of Employee Profile</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'ADD_ARRAY_ITEM', section: 'teamProfiles', item: { role: MASTER_ROLES[0], ...emptyContact() } })}><Plus className="h-4 w-4"/> Add</button></div>
      <div className="card-content space-y-4">
        {list.map((item, idx) => {
          const update = (field, val) => dispatch({ type: 'UPDATE_ARRAY_ITEM', section: 'teamProfiles', index: idx, field, value: val })
          const getErr = (f) => errors[`team.${idx}.${f}`]
          return (
            <div key={idx} className="rounded-lg border border-secondary-200 p-4 space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="form-label">Role</label><SelectWithOther className="input" value={item.role||''} onChange={(v)=>update('role',v)} options={MASTER_ROLES.map(r=>({value:r,label:r}))} placeholder="Select Role"/></div>
                  <div><label className="form-label">Name</label><input className="input" value={item.name||''} onChange={(e)=>update('name',e.target.value)}/></div>
                  <div><label className="form-label">Designation</label><input className="input" value={item.designation||''} onChange={(e)=>update('designation',e.target.value)}/></div>
                  <div><label className="form-label">Contact No</label><input className={`input ${getErr('contactNumber')?'border-red-500':''}`} value={item.contactNumber||''} onChange={(e)=>update('contactNumber',e.target.value)}/></div>
                  <div><label className="form-label">Email ID</label><input className={`input ${getErr('email')?'border-red-500':''}`} value={item.email||''} onChange={(e)=>update('email',e.target.value)}/></div>
                  <div><label className="form-label">Department</label><input className="input" value={item.department||''} onChange={(e)=>update('department',e.target.value)}/></div>
               </div>
               {list.length > 1 && <button type="button" className="text-danger-600 text-xs" onClick={()=>dispatch({type:'REMOVE_ARRAY_ITEM',section:'teamProfiles',index:idx})}>Remove</button>}
            </div>
          )
        })}
      </div>
    </section>
  )
})

const Step6Payment = React.memo(({ list, dispatch }) => {
  return (
    <section className="card">
       <div className="card-header flex justify-between"><h2 className="text-lg font-semibold">Creation of Payment Terms</h2><button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'ADD_ARRAY_ITEM', section: 'paymentTerms', item: defaultPaymentTerm() })}><Plus className="h-4 w-4"/> Add</button></div>
       <div className="card-content space-y-4">
         {list.map((item, idx) => {
           const update = (field, val) => dispatch({ type: 'UPDATE_ARRAY_ITEM', section: 'paymentTerms', index: idx, field, value: val })
           return (
             <div key={idx} className="rounded-lg border border-secondary-200 p-4 space-y-3">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div><label className="form-label">Basic</label><input className="input" value={item.basic||''} onChange={(e)=>update('basic',e.target.value)}/></div>
                 <div><label className="form-label">Freight</label><input className="input" value={item.freight||''} onChange={(e)=>update('freight',e.target.value)}/></div>
                 <div><label className="form-label">Taxes</label><input className="input" value={item.taxes||''} onChange={(e)=>update('taxes',e.target.value)}/></div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div><label className="form-label">1st Due</label><input className="input" value={item.due1||''} onChange={(e)=>update('due1',e.target.value)}/></div>
                 <div><label className="form-label">2nd Due</label><input className="input" value={item.due2||''} onChange={(e)=>update('due2',e.target.value)}/></div>
                 <div><label className="form-label">3rd Due</label><input className="input" value={item.due3||''} onChange={(e)=>update('due3',e.target.value)}/></div>
                 <div><label className="form-label">Final Due</label><input className="input" value={item.finalDue||''} onChange={(e)=>update('finalDue',e.target.value)}/></div>
               </div>
               <div><label className="form-label">Description</label><textarea className="input min-h-[80px]" value={item.description||''} onChange={(e)=>update('description',e.target.value)}/></div>
               {list.length > 1 && <button type="button" className="text-danger-600 text-xs" onClick={()=>dispatch({type:'REMOVE_ARRAY_ITEM',section:'paymentTerms',index:idx})}>Remove</button>}
             </div>
           )
         })}
       </div>
    </section>
  )
})

const Step7Review = React.memo(({ data, onSubmit, saving }) => (
  <section className="card">
    <div className="card-header"><h2 className="text-lg font-semibold text-secondary-900">Review & Submit</h2></div>
    <div className="card-content space-y-4">
      <div className="rounded-lg border border-secondary-200 p-6 bg-secondary-50">
        <p className="text-sm text-secondary-600 mb-4">Review and confirm all master data entries above.</p>
        <div className="space-y-3">
          {STEPS.slice(0, 6).map(s => (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">✓</span>
              <span className="text-secondary-700">{s.label} configured</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center pt-8 border-t border-secondary-200 mt-8">
        <button type="button" onClick={onSubmit} className="btn btn-secondary px-8 py-3 text-base font-semibold rounded-full shadow-sm flex items-center gap-2" disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin"/> Saving...</> : <><Save className="h-4 w-4"/> Save</>}
        </button>
      </div>
    </div>
  </section>
))

// --- MAIN COMPONENT ---

export default function CustomerNew() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')
  const { token } = useAuthContext()
  const svc = useMemo(() => createCustomerService(token), [token])

  const [state, dispatch] = useReducer(formReducer, initialState)
  const [currentStep, setCurrentStep] = useState(0)
  
  const [loadingData, setLoadingData] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [createdRecordId, setCreatedRecordId] = useState(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Initialization Logic
  useEffect(() => {
    const step = Number(searchParams.get('step'))
    if (step > 0 && step <= STEPS.length) setCurrentStep(step - 1)
    
    async function load() {
      if (!token) return
      setLoadingData(true)
      try {
        let loadedData = {}
        // 1. Try Load Master Data
        try {
          const res = await masterDataService.getMasterData()
          const d = res?.data || res || {}
          if (d.companyProfile) loadedData = d
        } catch (e) { console.log('No master data found') }

        // 2. If Edit, overlay specific customer data
        if (editId) {
          const res = await svc.get(editId)
          if (res?.metadata) loadedData = { ...loadedData, ...res.metadata }
        }

        // 3. Dispatch strict update (Merging with defaults to avoid undefined)
        const fullData = {
          companyProfile: { ...createDefaultCompanyProfile(), ...(loadedData.companyProfile || {}) },
          customerProfile: { ...createDefaultCustomerProfile(), ...(loadedData.customerProfile || {}) },
          consigneeProfiles: loadedData.consigneeProfiles?.length ? loadedData.consigneeProfiles : [emptyConsignee()],
          payerProfiles: loadedData.payerProfiles?.length ? loadedData.payerProfiles : [emptyPayer()],
          paymentTerms: loadedData.paymentTerms?.length ? loadedData.paymentTerms : [defaultPaymentTerm()],
          teamProfiles: loadedData.teamProfiles?.length ? loadedData.teamProfiles : [{ role: MASTER_ROLES[0], ...emptyContact() }],
          previews: { ...initialState.previews }
        }
        dispatch({ type: 'LOAD_DATA', payload: fullData })

      } catch (err) {
        console.error(err)
        setError('Failed to load data')
      } finally {
        setLoadingData(false)
      }
    }
    load()
  }, [editId, token, svc]) // REMOVED stepParam dependency to fix infinite loop

  const canGoNext = useMemo(() => {
    if (DEV_BYPASS_VALIDATION) return true
    const { isValid, errors } = getStepValidation(currentStep, state)
    if (!isValid) setFieldErrors(errors)
    else setFieldErrors({})
    return isValid
  }, [currentStep, state])

  const onNext = () => {
    setError('')
    if (canGoNext) {
      const next = Math.min(currentStep + 1, STEPS.length - 1)
      setCurrentStep(next)
      navigate(`/customers/new/form?step=${next + 1}${editId ? `&edit=${editId}` : ''}`, { replace: true })
      window.scrollTo(0, 0)
    } else {
      setError('Please fix the errors below')
      const firstError = document.querySelector('.border-red-500')
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const onPrev = () => {
    const prev = Math.max(0, currentStep - 1)
    setCurrentStep(prev)
    navigate(`/customers/new/form?step=${prev + 1}${editId ? `&edit=${editId}` : ''}`, { replace: true })
    window.scrollTo(0, 0)
  }

  const handleSaveToDatabase = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        companyProfile: state.companyProfile,
        customerProfile: state.customerProfile,
        consigneeProfiles: state.consigneeProfiles,
        payerProfiles: state.payerProfiles,
        paymentTerms: state.paymentTerms,
        teamProfiles: state.teamProfiles,
        additionalStep: { defaultCurrency: 'INR', defaultTax: '18', invoicePrefix: 'INV' }
      }

      await masterDataService.submitMasterData(payload)
      setSuccessData(payload) // For confirmation modal preview

      if (currentStep === 6) {
        // Final Submit Logic
        const customerRequest = {
            companyName: payload.companyProfile.companyName || payload.customerProfile.customerName,
            legalEntityName: payload.companyProfile.legalEntityName || payload.customerProfile.legalEntityName,
            name: payload.customerProfile.contactPersonName || payload.companyProfile.primaryContact?.name,
            email: payload.customerProfile.emailId || payload.companyProfile.primaryContact?.email,
            phone: payload.customerProfile.contactNumber || payload.companyProfile.primaryContact?.contactNumber,
            segment: payload.customerProfile.segment,
            gstNumber: payload.customerProfile.gstNumber,
            metadata: payload
        }
        let res
        if (editId) res = await svc.update(editId, customerRequest)
        else res = await svc.create(customerRequest)
        
        setCreatedRecordId(res?.data?.id || res?.data?._id || 'NEW')
        setShowSuccessPopup(true)
      } else {
        toast.success('Draft Saved Successfully')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to save')
      toast.error('Failed to save')
    } finally {
      setSaving(false)
      setConfirmOpen(false)
    }
  }

  if (loadingData) return <DashboardLayout><div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600"/></div></DashboardLayout>

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="mb-8 rounded-2xl border border-secondary-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-6 shadow-sm">
           <div className="flex flex-col gap-4">
             <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
               <div className="flex items-center gap-3">
                 <button onClick={() => navigate('/customers/new')} className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 px-3 py-2 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                 </button>
                 <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-secondary-900">Creation of Master Data</h1>
                    <p className="text-sm text-secondary-600">Stepwise onboarding for company, customer, payment, and team details.</p>
                    <p className="text-sm font-medium text-primary-700 mt-1">{STEPS[currentStep]?.label || 'Unknown'} - Step {currentStep + 1} of {STEPS.length}</p>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {error && <div className="mb-4 rounded-md border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700 flex items-center gap-2"><XCircle className="h-4 w-4"/>{error}</div>}

        <form onSubmit={(e) => { e.preventDefault(); return false; }} className="space-y-6 mb-20">
          {currentStep === 0 && <Step1Company data={state.companyProfile} dispatch={dispatch} errors={fieldErrors} preview={state.previews.logo} />}
          {currentStep === 1 && <Step2Customer data={state.customerProfile} dispatch={dispatch} errors={fieldErrors} preview={state.previews.customerLogo} />}
          {currentStep === 2 && <Step3Consignee list={state.consigneeProfiles} dispatch={dispatch} errors={fieldErrors} previews={state.previews.consignee} />}
          {currentStep === 3 && <Step4Payer list={state.payerProfiles} dispatch={dispatch} errors={fieldErrors} previews={state.previews.payer} />}
          {currentStep === 4 && <Step5Team list={state.teamProfiles} dispatch={dispatch} errors={fieldErrors} previews={state.previews.employee} />}
          {currentStep === 5 && <Step6Payment list={state.paymentTerms} dispatch={dispatch} />}
          {currentStep === 6 && <Step7Review data={state} onSubmit={() => setConfirmOpen(true)} saving={saving} />}
          
          {/* Navigation - UPDATED FOOTER */}
          {currentStep < 6 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex items-center justify-center z-10 md:pl-72 shadow-lg relative">
               {/* Previous Button - Absolute Left */}
              

               {/* Center Save Draft Button - Redesigned */}
               <button 
                 type="button" 
                 onClick={handleSaveToDatabase} 
                 disabled={saving} 
                 className="group relative inline-flex items-center justify-center gap-2 px-8 py-2.5 text-sm font-semibold text-secondary-700 bg-white border border-secondary-300 rounded-full shadow-sm hover:bg-secondary-50 hover:border-secondary-400 hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {saving ? (
                   <Loader2 className="h-4 w-4 animate-spin text-secondary-500" />
                 ) : (
                   <Save className="h-4 w-4 text-secondary-500 group-hover:text-secondary-700" />
                 )}
                 {saving ? 'Saving...' : 'Save Draft'}
               </button>
            </div>
          )}
        </form>

        {/* Confirmation Modal */}
        <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Submission" footer={(
            <div className="flex gap-2 justify-end w-full">
               <button className="btn btn-outline" onClick={() => setConfirmOpen(false)}>Cancel</button>
               <button className="btn btn-success" onClick={handleSaveToDatabase} disabled={saving}>{saving ? <Loader2 className="animate-spin"/> : 'Confirm & Submit'}</button>
            </div>
        )}>
           <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"><FileText className="h-5 w-5 text-blue-600"/></div>
              <div><h3 className="font-semibold text-gray-900">Submit Master Data?</h3><p className="text-sm text-gray-700">Are you sure you want to submit?</p></div>
           </div>
        </Modal>

        {/* Success Popup */}
        {showSuccessPopup && successData && (
           <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setShowSuccessPopup(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
                 <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-green-600"/></div>
                       <div><h3 className="text-lg font-semibold">Submitted Successfully</h3><p className="text-xs text-gray-500">ID: {createdRecordId}</p></div>
                    </div>
                    <button onClick={() => setShowSuccessPopup(false)}><XCircle className="h-5 w-5 text-gray-400"/></button>
                 </div>
                 <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                       <div className="bg-gray-50 p-4 rounded-lg border"><h4 className="font-semibold mb-2">Company</h4>{successData.companyProfile.companyName}</div>
                       <div className="bg-gray-50 p-4 rounded-lg border"><h4 className="font-semibold mb-2">Customer</h4>{successData.customerProfile.customerName}</div>
                       <div className="bg-gray-50 p-4 rounded-lg border"><h4 className="font-semibold mb-2">Consignees</h4>{successData.consigneeProfiles.length} Entries</div>
                    </div>
                 </div>
                 <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => {
                        window.location.reload()
                    }} className="btn btn-outline">Create Another</button>
                    <button onClick={() => navigate('/customers')} className="btn btn-primary">Done</button>
                 </div>
              </div>
           </div>
        )}
      </DashboardLayout>
    </ErrorBoundary>
  )
}