import React, { useState, useEffect } from 'react'
import { Filter, X, CheckSquare, Square } from 'lucide-react'

interface FieldConfig {
  name: string
  label: string
  required?: boolean
  section?: string
}

interface FieldVisibilityManagerProps {
  stepNumber: number
  stepTitle: string
  fields: FieldConfig[]
  visibleFields: string[]
  onVisibilityChange: (visibleFields: string[]) => void
}

export default function FieldVisibilityManager({
  stepNumber,
  stepTitle,
  fields,
  visibleFields,
  onVisibilityChange,
}: FieldVisibilityManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localVisibleFields, setLocalVisibleFields] = useState<string[]>(visibleFields)

  useEffect(() => {
    setLocalVisibleFields(visibleFields)
  }, [visibleFields])

  const handleToggleField = (fieldName: string) => {
    const newVisibleFields = localVisibleFields.includes(fieldName)
      ? localVisibleFields.filter(f => f !== fieldName)
      : [...localVisibleFields, fieldName]
    setLocalVisibleFields(newVisibleFields)
  }

  const handleSelectAll = () => {
    setLocalVisibleFields(fields.map(f => f.name))
  }

  const handleDeselectAll = () => {
    setLocalVisibleFields([])
  }

  const handleSave = () => {
    onVisibilityChange(localVisibleFields)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setLocalVisibleFields(visibleFields)
    setIsOpen(false)
  }

  // Group fields by section if they have sections
  const fieldsBySection = fields.reduce((acc, field) => {
    const section = field.section || 'General'
    if (!acc[section]) {
      acc[section] = []
    }
    acc[section].push(field)
    return acc
  }, {} as Record<string, FieldConfig[]>)

  const visibleCount = localVisibleFields.length
  const totalCount = fields.length

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        title="Filter which fields to show"
      >
        <Filter className="w-4 h-4" />
        <span>Filter Fields</span>
        {visibleCount < totalCount && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
            {visibleCount}/{totalCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Field Visibility Filter</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Step {stepNumber}: {stepTitle}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Actions */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">{visibleCount}</span> of{' '}
                <span className="font-semibold">{totalCount}</span> fields selected
              </div>
            </div>

            {/* Fields List */}
            <div className="flex-1 overflow-y-auto p-6">
              {Object.entries(fieldsBySection).map(([section, sectionFields]) => (
                <div key={section} className="mb-6 last:mb-0">
                  {Object.keys(fieldsBySection).length > 1 && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      {section}
                    </h3>
                  )}
                  <div className="space-y-2">
                    {sectionFields.map((field) => {
                      const isVisible = localVisibleFields.includes(field.name)
                      return (
                        <label
                          key={field.name}
                          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <div className="mt-0.5">
                            {isVisible ? (
                              <CheckSquare className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                {field.label}
                              </span>
                              {field.required && (
                                <span className="text-xs text-red-500 font-semibold">*</span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-mono">
                              {field.name}
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => handleToggleField(field.name)}
                            className="sr-only"
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

