import React, { useState, useRef, useEffect } from 'react'
import { Edit2, X, Check, Trash2, FileText } from 'lucide-react'

interface EditableFieldWrapperProps {
  children: React.ReactElement
  value: any
  onSave: (value: any) => void
  onClear?: () => void
  label?: string
  fieldName: string
  isSelectiveMode: boolean
  disabled?: boolean
  className?: string
}

export default function EditableFieldWrapper({
  children,
  value,
  onSave,
  onClear,
  label,
  fieldName,
  isSelectiveMode,
  disabled = false,
  className = '',
}: EditableFieldWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(value)
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEditedValue(value)
  }, [value])

  // Close edit mode when clicking outside
  useEffect(() => {
    if (isEditing && isSelectiveMode) {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          handleCancel()
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing, isSelectiveMode])

  const handleEdit = () => {
    if (disabled || !isSelectiveMode) return
    setEditedValue(value)
    setIsEditing(true)
    setIsHovered(false)
  }

  const handleSave = () => {
    onSave(editedValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedValue(value)
    setIsEditing(false)
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      setEditedValue('')
      onSave('')
    }
    setIsEditing(false)
  }

  const handleFill = () => {
    setIsEditing(true)
  }

  // If selective mode is OFF, render children normally
  if (!isSelectiveMode) {
    return <div className={className}>{children}</div>
  }

  // If selective mode is ON but not editing, show read-only with hover overlay
  if (!isEditing) {
    return (
      <div
        ref={containerRef}
        className={`relative group ${className}`}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        
        {/* Hover overlay with edit options */}
        {isHovered && !disabled && (
          <div className="absolute inset-0 bg-blue-50/90 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center z-10 transition-all">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-lg border border-blue-200">
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                title="Edit this field"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              {value && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                  title="Clear this field"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
              {!value && (
                <button
                  onClick={handleFill}
                  className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                  title="Fill this field"
                >
                  <FileText className="w-4 h-4" />
                  Fill
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Edit mode - show editable input with save/cancel
  const isFileInput = children.props.type === 'file' || children.props.accept !== undefined
  
  return (
    <div ref={containerRef} className={`border-2 border-blue-500 rounded-lg p-4 bg-blue-50/50 ${className}`}>
      <div className="space-y-3">
        {label && (
          <div className="text-sm font-semibold text-gray-700">
            {label}
            <span className="text-xs text-gray-500 ml-2 font-normal">({fieldName})</span>
          </div>
        )}
        
        {/* Clone the child element and make it editable */}
        <div className="bg-white rounded-lg p-2">
          {isFileInput ? (
            // For file inputs, render a file input directly
            <input
              type="file"
              accept={children.props.accept}
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setEditedValue(file)
              }}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            React.cloneElement(children, {
              value: editedValue,
              onChange: (e: any) => {
                const newValue = e.target?.value !== undefined ? e.target.value : e
                setEditedValue(newValue)
              },
              readOnly: false,
              disabled: false,
              className: `${children.props.className || ''} border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200`,
            })
          )}
        </div>

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

