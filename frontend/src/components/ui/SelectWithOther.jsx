import { useState, useEffect, forwardRef } from 'react'

/**
 * SelectWithOther - A reusable select component with "Other" option
 * 
 * When "Other" is selected, an input field appears for custom value entry
 * 
 * @param {Object} props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when value changes (receives the value)
 * @param {Array} props.options - Array of option objects { value, label } or array of strings
 * @param {string} props.placeholder - Placeholder text for select
 * @param {string} props.otherValue - The value that represents "Other" (default: "other")
 * @param {string} props.otherLabel - Label for "Other" option (default: "Other")
 * @param {string} props.otherInputPlaceholder - Placeholder for the "Other" input field
 * @param {string} props.className - Additional CSS classes for select
 * @param {string} props.inputClassName - Additional CSS classes for the "Other" input
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.name - Name attribute for the select
 * @param {string} props.id - ID attribute for the select
 */
const SelectWithOther = forwardRef(function SelectWithOther({
  value: controlledValue = '',
  onChange: controlledOnChange,
  options = [],
  placeholder = 'Select an option',
  otherValue = 'other',
  otherLabel = 'Other',
  otherInputPlaceholder = 'Please specify',
  className = '',
  inputClassName = '',
  disabled = false,
  name,
  id,
  ...rest
}, ref) {
  // Extract react-hook-form props if present
  const { onChange: rhfOnChange, onBlur: rhfOnBlur, value: rhfValue, ...selectProps } = rest
  // Use controlled value, react-hook-form value, or empty string
  const value = controlledValue !== undefined ? controlledValue : (rhfValue !== undefined ? rhfValue : '')
  const [isOtherSelected, setIsOtherSelected] = useState(false)
  const [otherInputValue, setOtherInputValue] = useState('')

  // Normalize options to always be array of { value, label } objects
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Check if current value is "other" or not in the options list
  useEffect(() => {
    const isOther = value === otherValue || 
                   (value && !normalizedOptions.some(opt => opt.value === value))
    
    setIsOtherSelected(isOther)
    
    // If value is "other" or not in options, set it as otherInputValue
    if (isOther && value !== otherValue) {
      setOtherInputValue(value)
    } else if (value === otherValue) {
      setOtherInputValue('')
    }
  }, [value, otherValue, normalizedOptions])

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value
    
    if (selectedValue === otherValue) {
      setIsOtherSelected(true)
      setOtherInputValue('')
      // Call react-hook-form's onChange if provided
      if (rhfOnChange) {
        rhfOnChange({ target: { value: otherValue, name: name || '' } })
      }
      controlledOnChange?.(otherValue)
    } else {
      setIsOtherSelected(false)
      setOtherInputValue('')
      // Call react-hook-form's onChange if provided
      if (rhfOnChange) {
        rhfOnChange(e)
      }
      controlledOnChange?.(selectedValue)
    }
  }

  const handleOtherInputChange = (e) => {
    const inputValue = e.target.value
    setOtherInputValue(inputValue)
    
    // Call react-hook-form's onChange if provided
    if (rhfOnChange) {
      rhfOnChange({ target: { value: inputValue, name: name || '' } })
    }
    controlledOnChange?.(inputValue)
  }

  const handleOtherInputBlur = (e) => {
    // Call react-hook-form's onBlur if provided
    if (rhfOnBlur) {
      rhfOnBlur(e)
    }
    
    // If input is empty when blurring, reset to "other" value
    if (!otherInputValue.trim() && isOtherSelected) {
      if (rhfOnChange) {
        rhfOnChange({ target: { value: otherValue, name: name || '' } })
      }
      controlledOnChange?.(otherValue)
    }
  }

  return (
    <div className="space-y-2">
      <select
        ref={ref}
        className={className || 'input'}
        value={isOtherSelected ? otherValue : (value || '')}
        onChange={handleSelectChange}
        onBlur={rhfOnBlur}
        disabled={disabled}
        name={name || selectProps.name}
        id={id || selectProps.id}
        {...selectProps}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {normalizedOptions.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label || option.value}
          </option>
        ))}
        <option value={otherValue}>{otherLabel}</option>
      </select>
      
      {isOtherSelected && (
        <input
          type="text"
          className={inputClassName || 'input mt-2'}
          placeholder={otherInputPlaceholder}
          value={otherInputValue}
          onChange={handleOtherInputChange}
          onBlur={handleOtherInputBlur}
          disabled={disabled}
          autoFocus
        />
      )}
    </div>
  )
})

export default SelectWithOther

