# Button Design System - Comprehensive Guide

## Overview
All buttons across the Financial Management System now follow a minimal, perfectly aligned design system. This ensures consistency, improved UX, and better accessibility across all pages and components.

## Button Classes (globals.css)

### Base Class: `.btn`
```css
.btn {
  @apply inline-flex items-center justify-center gap-2 
         rounded-md text-sm font-medium 
         transition-all duration-200 
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
         disabled:opacity-60 disabled:cursor-not-allowed 
         active:scale-[0.98];
}
```
- **Alignment**: Flexbox with centered items and gap for perfect alignment
- **Animation**: Smooth transitions on all interactive states
- **Accessibility**: Focus ring for keyboard navigation
- **Feedback**: Scale animation on active state for tactile feedback

### Variants

#### Primary Buttons: `.btn-primary`
```css
.btn-primary {
  @apply bg-primary-600 text-white 
         hover:bg-primary-700 active:bg-primary-800 
         focus-visible:ring-primary-500 
         shadow-sm hover:shadow-md;
}
```
- **Usage**: Main CTAs, form submissions, important actions
- **Color**: Blue gradient from primary palette
- **Feedback**: Darker hover state, elevated shadow

#### Secondary Buttons: `.btn-secondary`
```css
.btn-secondary {
  @apply bg-secondary-100 text-secondary-900 
         hover:bg-secondary-200 active:bg-secondary-300 
         focus-visible:ring-secondary-500 
         dark:bg-secondary-700 dark:text-secondary-100 
         dark:hover:bg-secondary-600;
}
```
- **Usage**: Filters, toggles, alternative actions
- **Color**: Neutral gray palette
- **Dark Mode**: Full dark mode support

#### Outline Buttons: `.btn-outline`
```css
.btn-outline {
  @apply border border-secondary-300 bg-white 
         text-secondary-900 hover:bg-secondary-50 
         active:bg-secondary-100 
         focus-visible:ring-secondary-500 
         dark:border-secondary-600 dark:bg-secondary-800 
         dark:text-secondary-100 dark:hover:bg-secondary-700;
}
```
- **Usage**: Cancel, back, secondary actions
- **Border**: Subtle border with hover fill
- **Transparency**: No shadow, minimal visual weight

#### Ghost Buttons: `.btn-ghost`
```css
.btn-ghost {
  @apply text-secondary-700 hover:bg-secondary-100 
         active:bg-secondary-200 
         focus-visible:ring-secondary-500 
         dark:text-secondary-300 dark:hover:bg-secondary-700;
}
```
- **Usage**: Links, breadcrumbs, tertiary actions
- **Style**: Text-only, appears on hover
- **Weight**: Lightest visual presence

#### Danger Buttons: `.btn-danger`
```css
.btn-danger {
  @apply bg-danger-600 text-white 
         hover:bg-danger-700 active:bg-danger-800 
         focus-visible:ring-danger-500 
         shadow-sm hover:shadow-md;
}
```
- **Usage**: Destructive actions (delete, remove)
- **Color**: Red danger palette
- **Warning**: Clear visual differentiation

#### Success Buttons: `.btn-success`
```css
.btn-success {
  @apply bg-success-600 text-white 
         hover:bg-success-700 active:bg-success-800 
         focus-visible:ring-success-500 
         shadow-sm hover:shadow-md;
}
```
- **Usage**: Confirmations, completions, save actions
- **Color**: Green success palette

### Sizes

#### Small: `.btn-sm`
```css
.btn-sm { @apply px-3 py-1.5 text-sm; }
```
- **Padding**: 3px horizontal, 1.5px vertical
- **Usage**: Inline buttons, filters, table actions
- **Height**: ~28px

#### Medium: `.btn-md` (Default)
```css
.btn-md { @apply px-4 py-2 text-sm; }
```
- **Padding**: 4px horizontal, 2px vertical
- **Usage**: Form buttons, action buttons
- **Height**: ~32px

#### Large: `.btn-lg`
```css
.btn-lg { @apply px-6 py-2.5 text-base; }
```
- **Padding**: 6px horizontal, 2.5px vertical
- **Usage**: CTAs, main form submissions
- **Height**: ~36px

#### XL: `.btn-xl`
```css
.btn-xl { @apply px-8 py-3 text-base; }
```
- **Padding**: 8px horizontal, 3px vertical
- **Usage**: Hero section buttons, primary CTAs
- **Height**: ~40px

#### Icon Buttons
```css
.btn-icon { @apply p-2 rounded-md; }
.btn-icon-sm { @apply p-1.5 rounded-md; }
.btn-icon-lg { @apply p-2.5 rounded-md; }
```

## Usage Examples

### Login Button
```jsx
<button className="btn btn-primary btn-lg w-full">Sign In</button>
```

### Cancel Button
```jsx
<button className="btn btn-outline btn-md">Cancel</button>
```

### Action Group
```jsx
<div className="flex items-center gap-2">
  <button className="btn btn-primary btn-md">Save</button>
  <button className="btn btn-outline btn-md">Cancel</button>
  <button className="btn btn-danger btn-sm">Delete</button>
</div>
```

### With Icon
```jsx
<button className="btn btn-primary btn-md">
  <Icon className="h-4 w-4" />
  Create New
</button>
```

### Button States
```jsx
// Loading state
<button className="btn btn-primary btn-md" disabled>
  <Spinner className="h-4 w-4 animate-spin" />
  Processing...
</button>

// Disabled state
<button className="btn btn-primary btn-md" disabled>
  Disabled Action
</button>
```

## Key Features

### 1. **Perfect Alignment**
- All buttons use flexbox with `items-center justify-center`
- Consistent gap between icons and text (`gap-2`)
- Proper baseline alignment for text and icons

### 2. **Minimal Design**
- No excessive shadows or effects
- Clean, modern appearance
- Subtle hover/active states
- Focus ring for accessibility

### 3. **Responsive**
- Scales appropriately on mobile
- Touch-friendly sizing (minimum 44px height)
- Works seamlessly with flex and grid layouts

### 4. **Accessibility**
- Focus visible states with ring
- Proper disabled state styling
- Sufficient color contrast
- Clear visual feedback

### 5. **Dark Mode Support**
- All variants include dark mode styles
- Consistent colors across themes
- Proper contrast ratios maintained

## Components Updated

### Pages
- ✅ `index.jsx` - Login page buttons
- ✅ `profile.jsx` - Theme and settings buttons
- ✅ `settings.jsx` - Quick action buttons
- ✅ `payments.jsx` - Modal footer buttons
- ✅ `reports.jsx` - Download button
- ✅ `dashboard/new-po.jsx` - Action buttons
- ✅ `dashboard/others.jsx` - Export/refresh buttons
- ✅ `dashboard/performance.jsx` - Export/refresh buttons
- ✅ `customers/[id].jsx` - Edit/save buttons
- ✅ `subscription.jsx` - Plan selection buttons
- ✅ `home.jsx` - Hero CTA buttons

### Components
- ✅ `layout/DashboardLayout.jsx` - Logout button
- ✅ `layout/Footer.jsx` - Subscribe button
- ✅ `ui/ErrorBoundary.jsx` - Error recovery buttons
- ✅ `tailadmin/ecommerce/StatisticsChart.jsx` - Tab buttons
- ✅ `tailadmin/ecommerce/RecentOrders.jsx` - Filter buttons

## Best Practices

### Do ✅
- Use predefined btn classes for consistency
- Combine variant and size classes: `btn btn-primary btn-md`
- Use `w-full` for full-width buttons in forms
- Add icons to clarify button purpose
- Use appropriate variant for action type

### Don't ❌
- Create custom button styles inline
- Mix different button styling approaches
- Use mismatched sizes without reason
- Override focus-visible states
- Use buttons for navigation (use links instead)

## Migration from Old Styles

### Old Style
```jsx
<button className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700">
  Save
</button>
```

### New Style
```jsx
<button className="btn btn-primary btn-md">
  Save
</button>
```

## Testing Checklist

- [ ] All buttons properly aligned
- [ ] Hover states working smoothly
- [ ] Active states provide feedback
- [ ] Disabled states look inactive
- [ ] Focus ring visible on keyboard nav
- [ ] Dark mode looks correct
- [ ] Mobile touch targets ≥44px
- [ ] Icons align with text
- [ ] Gap between icon and text consistent
- [ ] Loading states smooth
- [ ] Accessibility test passed

## Color Reference

### Primary (Blue)
- Default: `bg-primary-600`
- Hover: `bg-primary-700`
- Active: `bg-primary-800`

### Secondary (Gray)
- Default: `bg-secondary-100`
- Hover: `bg-secondary-200`
- Active: `bg-secondary-300`

### Danger (Red)
- Default: `bg-danger-600`
- Hover: `bg-danger-700`
- Active: `bg-danger-800`

### Success (Green)
- Default: `bg-success-600`
- Hover: `bg-success-700`
- Active: `bg-success-800`

## Support

For button styling questions or to add new button variants, refer to:
- `frontend/src/styles/globals.css` - Button class definitions
- `frontend/src/components/ui/Button.jsx` - Reusable Button component
- Tailwind config: `frontend/tailwind.config.js`
