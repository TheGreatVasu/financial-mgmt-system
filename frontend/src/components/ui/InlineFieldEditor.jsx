import React, { useState, useRef, useEffect } from 'react'
import { Edit2, X, Check, MoreVertical, FileText, Tag } from 'lucide-react'

/**
 * InlineFieldEditor - A reusable component for inline field editing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The field content to display
 * @param {string} props.label - Field label
 * @param {string} props.value - Current field value
 * @param {Function} props.onSave - Callback when saving (receives { value, label })
 * @param {string} props.type - Input type (text, textarea, select, etc.)
 * @param {Array} props.options - Options for select type
 * @param {boolean} props.readOnly - Whether the field is read-only by default
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Whether field is required
 */
export default function InlineFieldEditor({
  children,
  label: initialLabel,
  value: initialValue,
  onSave,
  type = 'text',
  options = null,
  readOnly = true,
  placeholder = '',
  required = false,
  className = '',
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editMode, setEditMode] = useState(null) // 'value', 'label', or 'both'
  const [editedValue, setEditedValue] = useState(initialValue || '')
  const [editedLabel, setEditedLabel] = useState(initialLabel || '')
  const [isHovered, setIsHovered] = useState(false)
  
  const menuRef = useRef(null)
  const containerRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Reset state when value/label changes externally
  useEffect(() => {
    setEditedValue(initialValue || '')
  }, [initialValue])

  useEffect(() => {
    setEditedLabel(initialLabel || '')
  }, [initialLabel])

  const handleEditValue = () => {
    setEditMode('value')
    setIsEditing(true)
    setShowMenu(false)
    setEditedValue(initialValue || '')
  }

  const handleEditLabel = () => {
    setEditMode('label')
    setIsEditing(true)
    setShowMenu(false)
    setEditedLabel(initialLabel || '')
  }

  const handleEditBoth = () => {
    setEditMode('both')
    setIsEditing(true)
    setShowMenu(false)
    setEditedValue(initialValue || '')
    setEditedLabel(initialLabel || '')
  }

  const handleSave = () => {
    if (onSave) {
      const updates = {}
      if (editMode === 'value' || editMode === 'both') {
        updates.value = editedValue
      }
      if (editMode === 'label' || editMode === 'both') {
        updates.label = editedLabel
      }
      onSave(updates)
    }
    setIsEditing(false)
    setEditMode(null)
    setShowMenu(false)
  }

  const handleCancel = () => {
    setEditedValue(initialValue || '')
    setEditedLabel(initialLabel || '')
    setIsEditing(false)
    setEditMode(null)
    setShowMenu(false)
  }

  const handleReplaceValue = () => {
    setEditedValue('')
    setEditMode('value')
    setIsEditing(true)
    setShowMenu(false)
  }

  // If not in edit mode, show read-only view with hover actions
  if (!isEditing && readOnly) {
    return (
      <div
        ref={containerRef}
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Read-only field display */}
        <div className="relative">
          {children}
          
          {/* Hover overlay with edit button */}
          {isHovered && (
            <div className="absolute inset-0 bg-blue-50/80 border-2 border-blue-300 border-dashed rounded-lg flex items-center justify-center z-10 transition-all">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-md border border-blue-200">
                <button
                  onClick={() => setShowMenu(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Field
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action menu dropdown */}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Edit Options</p>
            </div>
            <div className="py-1">
              <button
                onClick={handleEditValue}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <div>
                  <div className="font-medium">Edit Value</div>
                  <div className="text-xs text-gray-500">Modify the field value</div>
                </div>
              </button>
              <button
                onClick={handleReplaceValue}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <div>
                  <div className="font-medium">Replace Value</div>
                  <div className="text-xs text-gray-500">Clear and enter new value</div>
                </div>
              </button>
              <button
                onClick={handleEditLabel}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors"
              >
                <Tag className="w-4 h-4" />
                <div>
                  <div className="font-medium">Update Label</div>
                  <div className="text-xs text-gray-500">Change field label/placeholder</div>
                </div>
              </button>
              <button
                onClick={handleEditBoth}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors border-t border-gray-100 mt-1"
              >
                <MoreVertical className="w-4 h-4" />
                <div>
                  <div className="font-medium">Edit Both</div>
                  <div className="text-xs text-gray-500">Edit value and label together</div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Edit mode view
  return (
    <div className={`border-2 border-blue-400 rounded-lg p-4 bg-blue-50/50 ${className}`}>
      <div className="space-y-3">
        {/* Label editor (if editing label) */}
        {(editMode === 'label' || editMode === 'both') && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Field Label {required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              placeholder="Enter field label"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus={editMode === 'label'}
            />
          </div>
        )}

        {/* Value editor */}
        {(editMode === 'value' || editMode === 'both') && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {editedLabel || initialLabel} {required && <span className="text-red-500">*</span>}
            </label>
            {type === 'textarea' ? (
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder={placeholder || `Enter ${editedLabel || initialLabel}`}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus={editMode === 'value'}
              />
            ) : options ? (
              <select
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus={editMode === 'value'}
              >
                <option value="">Select {editedLabel || initialLabel}</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder={placeholder || `Enter ${editedLabel || initialLabel}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus={editMode === 'value'}
              />
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

