import { Building2, Mail, Phone, FileText, MapPin, Users, CreditCard, UserCheck } from 'lucide-react'
import Modal from '../ui/Modal.jsx'

export default function MasterDataPreviewModal({ open, onClose, customer }) {
  if (!customer) return null

  const companyName = customer.companyName || customer.company_name || 'Unnamed Company'
  const name = customer.name || 'N/A'
  const email = customer.email || customer.contact_email || 'N/A'
  const phone = customer.phone || customer.contact_phone || 'N/A'
  const metadata = customer.metadata || {}
  const companyProfile = metadata.companyProfile || {}
  const customerProfile = metadata.customerProfile || {}
  const paymentTerms = metadata.paymentTerms || []
  const teamProfiles = metadata.teamProfiles || []
  const masterProfile = customer.masterProfile || {}
  const siteOffices = customer.siteOffices || []
  const plantAddresses = customer.plantAddresses || []
  const consigneeProfile = metadata.consigneeProfile || {}
  const payerProfile = metadata.payerProfile || {}
  const employeeProfile = metadata.employeeProfile || {}

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Master Data Preview - ${companyName}`}
      size="xl"
      footer={
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5" />
              <p className="text-sm font-medium text-blue-100">Company</p>
            </div>
            <p className="text-lg font-bold">{companyName}</p>
            {masterProfile.legal_entity_name && (
              <p className="text-xs text-blue-100 mt-1">{masterProfile.legal_entity_name}</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5" />
              <p className="text-sm font-medium text-green-100">Contact</p>
            </div>
            <p className="text-lg font-bold truncate">{email !== 'N/A' ? email : 'N/A'}</p>
            <p className="text-xs text-green-100 mt-1">{phone !== 'N/A' ? phone : 'N/A'}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5" />
              <p className="text-sm font-medium text-purple-100">GST</p>
            </div>
            <p className="text-lg font-bold truncate">{customer.gst_number || 'N/A'}</p>
          </div>
        </div>

        {/* Company Profile */}
        {(companyProfile.companyName || companyProfile.legalEntityName || companyProfile.corporateOffice || companyProfile.marketingOffice) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Company Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companyProfile.companyName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Company Name</p>
                  <p className="text-sm font-semibold text-gray-900">{companyProfile.companyName}</p>
                </div>
              )}
              {companyProfile.legalEntityName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Legal Entity Name</p>
                  <p className="text-sm font-semibold text-gray-900">{companyProfile.legalEntityName}</p>
                </div>
              )}
              {companyProfile.corporateOffice?.addressLine && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Corporate Office</p>
                  <p className="text-sm text-gray-900">{companyProfile.corporateOffice.addressLine}</p>
                  {companyProfile.corporateOffice.gstNumber && (
                    <p className="text-xs text-gray-600 mt-1">GST: {companyProfile.corporateOffice.gstNumber}</p>
                  )}
                </div>
              )}
              {companyProfile.marketingOffice?.addressLine && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Marketing Office</p>
                  <p className="text-sm text-gray-900">{companyProfile.marketingOffice.addressLine}</p>
                  {companyProfile.marketingOffice.gstNumber && (
                    <p className="text-xs text-gray-600 mt-1">GST: {companyProfile.marketingOffice.gstNumber}</p>
                  )}
                </div>
              )}
              {companyProfile.correspondenceAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Correspondence Address</p>
                  <p className="text-sm text-gray-900">{companyProfile.correspondenceAddress}</p>
                </div>
              )}
              {companyProfile.gstNumbers && companyProfile.gstNumbers.length > 0 && companyProfile.gstNumbers.some(g => g) && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-2">GST Numbers</p>
                  <div className="flex flex-wrap gap-2">
                    {companyProfile.gstNumbers.filter(g => g).map((gst, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium">
                        {gst}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {companyProfile.primaryContact && (companyProfile.primaryContact.name || companyProfile.primaryContact.email || companyProfile.primaryContact.contactNumber) && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Primary Contact</p>
                  <div className="space-y-1">
                    {companyProfile.primaryContact.name && (
                      <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {companyProfile.primaryContact.name}</p>
                    )}
                    {companyProfile.primaryContact.email && (
                      <p className="text-sm text-gray-900"><span className="font-medium">Email:</span> {companyProfile.primaryContact.email}</p>
                    )}
                    {companyProfile.primaryContact.contactNumber && (
                      <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {companyProfile.primaryContact.contactNumber}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Site Offices */}
            {siteOffices.length > 0 && siteOffices.some(so => so.address_line || so.addressLine) && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Site Offices</p>
                <div className="space-y-2">
                  {siteOffices.filter(so => so.address_line || so.addressLine).map((site, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">{site.label || `Site Office ${index + 1}`}</p>
                      <p className="text-sm text-gray-700">{site.address_line || site.addressLine}</p>
                      {site.gst_number || site.gstNumber ? (
                        <p className="text-xs text-gray-600 mt-1">GST: {site.gst_number || site.gstNumber}</p>
                      ) : null}
                      {site.contact_number || site.contactNumber ? (
                        <p className="text-xs text-gray-600">Contact: {site.contact_number || site.contactNumber}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plant Addresses */}
            {plantAddresses.length > 0 && plantAddresses.some(pa => pa.address_line || pa.addressLine) && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Plant Addresses</p>
                <div className="space-y-2">
                  {plantAddresses.filter(pa => pa.address_line || pa.addressLine).map((plant, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-900 mb-1">{plant.label || `Plant Address ${index + 1}`}</p>
                      <p className="text-sm text-gray-700">{plant.address_line || plant.addressLine}</p>
                      {plant.gst_number || plant.gstNumber ? (
                        <p className="text-xs text-gray-600 mt-1">GST: {plant.gst_number || plant.gstNumber}</p>
                      ) : null}
                      {plant.contact_number || plant.contactNumber ? (
                        <p className="text-xs text-gray-600">Contact: {plant.contact_number || plant.contactNumber}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Customer Profile */}
        {(customerProfile.contactPersonName || customerProfile.emailId || customerProfile.contactPersonNumber || customerProfile.department || customerProfile.designation || customerProfile.jobRole || customerProfile.segment) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-600" />
              Customer Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerProfile.contactPersonName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Person Name</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.contactPersonName}</p>
                </div>
              )}
              {customerProfile.contactPersonNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Number</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.contactPersonNumber}</p>
                </div>
              )}
              {customerProfile.emailId && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email ID</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.emailId}</p>
                </div>
              )}
              {customerProfile.department && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Department</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.department}</p>
                </div>
              )}
              {customerProfile.designation && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Designation</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.designation}</p>
                </div>
              )}
              {customerProfile.jobRole && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Job Role</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.jobRole}</p>
                </div>
              )}
              {customerProfile.segment && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Segment</p>
                  <p className="text-sm font-semibold text-gray-900">{customerProfile.segment}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Consignee Profile */}
        {(consigneeProfile.consigneeName || consigneeProfile.consigneeAddress) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Consignee Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consigneeProfile.consigneeName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Consignee Name</p>
                  <p className="text-sm font-semibold text-gray-900">{consigneeProfile.consigneeName}</p>
                </div>
              )}
              {consigneeProfile.consigneeAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{consigneeProfile.consigneeAddress}</p>
                </div>
              )}
              {consigneeProfile.gstNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm font-semibold text-gray-900">{consigneeProfile.gstNumber}</p>
                </div>
              )}
              {consigneeProfile.contactPersonName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                  <p className="text-sm font-semibold text-gray-900">{consigneeProfile.contactPersonName}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Payer Profile */}
        {(payerProfile.payerName || payerProfile.payerAddress) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Payer Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payerProfile.payerName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payer Name</p>
                  <p className="text-sm font-semibold text-gray-900">{payerProfile.payerName}</p>
                </div>
              )}
              {payerProfile.payerAddress && (
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Address</p>
                  <p className="text-sm text-gray-900">{payerProfile.payerAddress}</p>
                </div>
              )}
              {payerProfile.gstNumber && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">GST Number</p>
                  <p className="text-sm font-semibold text-gray-900">{payerProfile.gstNumber}</p>
                </div>
              )}
              {payerProfile.contactPersonName && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Contact Person</p>
                  <p className="text-sm font-semibold text-gray-900">{payerProfile.contactPersonName}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Payment Terms */}
        {paymentTerms.length > 0 && paymentTerms.some(pt => pt.title || pt.description) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Payment Terms
            </h3>
            <div className="space-y-3">
              {paymentTerms.filter(pt => pt.title || pt.description).map((term, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{term.title || `Payment Term ${index + 1}`}</p>
                    {term.type && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                        {term.type}
                      </span>
                    )}
                  </div>
                  {term.description && (
                    <p className="text-sm text-gray-700 mt-2">{term.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-600">
                    {term.creditDays !== undefined && term.creditDays !== null && term.creditDays !== '' && (
                      <span><span className="font-medium">Credit Days:</span> {term.creditDays}</span>
                    )}
                    {term.applicableFor && (
                      <span><span className="font-medium">Applicable For:</span> {term.applicableFor}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Team Profiles */}
        {teamProfiles.length > 0 && teamProfiles.some(tp => tp.name) && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Team Profiles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {teamProfiles.filter(tp => tp.name).map((member, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">{member.role || `Team Member ${index + 1}`}</p>
                  <p className="text-sm text-gray-700">{member.name}</p>
                  {member.email && (
                    <p className="text-xs text-gray-600 mt-1">{member.email}</p>
                  )}
                  {member.contactNumber && (
                    <p className="text-xs text-gray-600">{member.contactNumber}</p>
                  )}
                  {(member.department || member.designation) && (
                    <p className="text-xs text-gray-600 mt-1">
                      {member.department && member.designation 
                        ? `${member.department} - ${member.designation}`
                        : member.department || member.designation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Employee Profile */}
        {employeeProfile && Object.keys(employeeProfile).length > 0 && (
          <section className="bg-gray-50 rounded-xl p-5 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Employee Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(employeeProfile).map(([key, value]) => {
                if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return null
                return (
                  <div key={key}>
                    <p className="text-xs text-gray-500 mb-1">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                    <p className="text-sm font-semibold text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </Modal>
  )
}

