import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuthContext } from '../../context/AuthContext.jsx'
import { createSearchService } from '../../services/searchService'
import { getSharedFieldKey, getFieldBehavior } from '../../config/sharedFieldMapping'

/**
 * SmartDropdown
 *
 * A reusable input component that shows live, fuzzy suggestions
 * pulled from a universal backend search endpoint.
 *
 * Props:
 *  - value: string
 *  - onChange: (value: string) => void
 *  - fieldName: string (UI field name, e.g. "customerName", "poNo")
 *  - fieldKey: string (optional explicit backend key, e.g. "customerName")
 *  - placeholder: string
 *  - inputClassName: string (applied to the underlying <input>)
 *  - disabled: boolean
 */
export default function SmartDropdown({
  value,
  onChange,
  fieldName,
  fieldKey,
  placeholder,
  inputClassName = 'input',
  disabled = false,
}) {
  const { token } = useAuthContext()
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  const wrapperRef = useRef(null)
  const debouncedRef = useRef(null)
  const initialLoadedRef = useRef(false)

  const effectiveFieldKey = useMemo(
    () => fieldKey || getSharedFieldKey(fieldName),
    [fieldKey, fieldName]
  )

  const behavior = useMemo(
    () => getFieldBehavior(fieldName),
    [fieldName]
  )

  const openOnFocus = behavior.openOnFocus === true

  const canSearch = !!token && !!effectiveFieldKey

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function runSearch(text) {
    if (!canSearch) return
    const searchText = (text || '').trim()
    try {
      setLoading(true)
      const searchApi = createSearchService(token)
      const { suggestions: raw } = await searchApi.search(effectiveFieldKey, searchText)

      // Basic fuzzy filter on client as an extra layer
      const lower = searchText.toLowerCase()
      const filtered =
        lower.length === 0
          ? (raw || [])
          : (raw || []).filter((s) =>
              String(s || '').toLowerCase().includes(lower)
            )

      setSuggestions(filtered)
      setOpen(filtered.length > 0 || openOnFocus)
      setHighlightIndex(-1)
    } catch (err) {
      // Fail silently; we never block typing
      // eslint-disable-next-line no-console
      console.error('SmartDropdown search error:', err)
      setSuggestions([])
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!canSearch) return

    if (debouncedRef.current) {
      clearTimeout(debouncedRef.current)
    }

    debouncedRef.current = setTimeout(() => {
      runSearch(query)
    }, 250)

    return () => {
      if (debouncedRef.current) {
        clearTimeout(debouncedRef.current)
      }
    }
  }, [query, token, effectiveFieldKey, canSearch])

  function handleSelect(suggestion) {
    if (!onChange) return
    onChange(suggestion)
    setQuery(suggestion)
    setOpen(false)
    setHighlightIndex(-1)
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1
      )
    } else if (e.key === 'Enter') {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault()
        handleSelect(suggestions[highlightIndex])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      setHighlightIndex(-1)
    }
  }

  if (!canSearch) {
    return (
      <input
        className={inputClassName}
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    )
  }

  const searchText = (query || '').trim().toLowerCase()

  const renderHighlighted = (text) => {
    if (!searchText) return text
    const lower = String(text || '')
    const idx = lower.toLowerCase().indexOf(searchText)
    if (idx === -1) return text
    const before = lower.slice(0, idx)
    const match = lower.slice(idx, idx + searchText.length)
    const after = lower.slice(idx + searchText.length)
    return (
      <>
        {before}
        <span className="font-semibold text-primary-700">{match}</span>
        {after}
      </>
    )
  }

  const listboxId = useMemo(
    () => `smart-dropdown-${effectiveFieldKey || 'field'}-${Math.random().toString(36).slice(2, 8)}`,
    [effectiveFieldKey]
  )

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        className={inputClassName}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange?.(e.target.value)
        }}
        onFocus={() => {
          if (!open && openOnFocus) {
            setOpen(true)
            if (!initialLoadedRef.current) {
              initialLoadedRef.current = true
              // Load initial suggestions without waiting for typing
              runSearch(query)
            }
          } else if (suggestions.length > 0) {
            setOpen(true)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
      />
      {loading && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <div className="h-3 w-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 w-full rounded-md border border-secondary-200 bg-white shadow-lg max-h-60 overflow-auto text-sm"
        >
          {suggestions.map((s, idx) => (
            <button
              key={`${s}-${idx}`}
              type="button"
              className={`w-full text-left px-3 py-2 hover:bg-secondary-50 ${
                idx === highlightIndex ? 'bg-secondary-100' : ''
              }`}
              role="option"
              aria-selected={idx === highlightIndex}
              onMouseDown={(e) => {
                // Prevent input blur before click
                e.preventDefault()
                handleSelect(s)
              }}
            >
              {renderHighlighted(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


