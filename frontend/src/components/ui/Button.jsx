import React from 'react'
import { cn } from '../../utils/cn'

/**
 * Minimal, perfectly aligned Button component
 * Supports multiple variants, sizes, and states
 * All buttons use consistent spacing, alignment, and typography
 */
const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = 'left',
  ...props
}, ref) => {
  // Base styles - consistent alignment and spacing
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

  // Variant styles
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-500 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600',
    outline: 'border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-secondary-500 dark:border-secondary-600 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500 shadow-sm hover:shadow-md',
    success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500 shadow-sm hover:shadow-md',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800 focus-visible:ring-warning-500 shadow-sm hover:shadow-md',
    ghost: 'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-500 dark:text-secondary-300 dark:hover:bg-secondary-700',
  }

  // Size styles - consistent padding and font
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base',
    xl: 'px-8 py-3 text-base',
  }

  // Full width
  const widthClass = fullWidth ? 'w-full' : ''

  // Combine classes
  const buttonClass = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    widthClass,
    disabled && 'pointer-events-none',
    className
  )

  // Icon rendering
  const renderIcon = () => {
    if (!Icon) return null
    if (isLoading) return <span className="animate-spin">⏳</span>
    return <Icon className="w-4 h-4" />
  }

  // Content with icon position
  const renderContent = () => {
    if (!Icon && !isLoading) {
      return children
    }

    const iconElement = renderIcon()
    const textElement = <span>{children}</span>

    return iconPosition === 'left' 
      ? [iconElement, textElement]
      : [textElement, iconElement]
  }

  return (
    <button
      ref={ref}
      className={buttonClass}
      disabled={disabled || isLoading}
      {...props}
    >
      {renderContent()}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
