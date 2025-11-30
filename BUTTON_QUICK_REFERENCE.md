# Button System - Quick Reference Guide

## One-Line Cheat Sheet

```jsx
// Most common button types:
<button className="btn btn-primary btn-md">Action</button>
<button className="btn btn-outline btn-md">Cancel</button>
<button className="btn btn-danger btn-sm">Delete</button>
<button className="btn btn-ghost btn-md">Link</button>
```

## Class Structure
```
btn [variant] [size] [modifiers]
```

## All Variants
| Class | Usage | Color |
|-------|-------|-------|
| `btn-primary` | Main actions | Blue |
| `btn-secondary` | Filters, toggles | Gray |
| `btn-outline` | Cancel, back | White border |
| `btn-ghost` | Links, tertiary | Text only |
| `btn-danger` | Delete, destructive | Red |
| `btn-success` | Confirm, save | Green |

## All Sizes
| Class | Height | Usage |
|-------|--------|-------|
| `btn-sm` | 28px | Inline, table actions |
| `btn-md` | 32px | Form buttons (default) |
| `btn-lg` | 36px | CTAs, main buttons |
| `btn-xl` | 40px | Hero buttons |

## Common Patterns

### Login Button
```jsx
<button className="btn btn-primary btn-lg w-full">
  Sign In
</button>
```

### Form Actions
```jsx
<div className="flex gap-2">
  <button className="btn btn-primary btn-md">Save</button>
  <button className="btn btn-outline btn-md">Cancel</button>
</div>
```

### Table Actions
```jsx
<button className="btn btn-outline btn-sm">Edit</button>
<button className="btn btn-danger btn-sm">Delete</button>
```

### Icon Button
```jsx
<button className="btn btn-primary btn-md">
  <Icon className="h-4 w-4" />
  Create
</button>
```

### Loading State
```jsx
<button className="btn btn-primary btn-md" disabled>
  <Spinner className="h-4 w-4 animate-spin" />
  Loading...
</button>
```

### Disabled Button
```jsx
<button className="btn btn-primary btn-md" disabled>
  Disabled
</button>
```

### Full Width Button
```jsx
<button className="btn btn-primary btn-md w-full">
  Submit
</button>
```

### Ghost/Link Button
```jsx
<button className="btn btn-ghost btn-md">
  Learn More
</button>
```

## Visual Styles at a Glance

### Primary (Blue)
- Background: `bg-primary-600`
- Text: White
- Hover: Darker blue (`bg-primary-700`)
- Shadow: Elevated on hover
- Use: Main CTAs, form submissions

### Outline (White with Border)
- Background: White
- Border: Gray
- Text: Dark gray
- Hover: Light gray fill
- Use: Cancel, back, secondary actions

### Danger (Red)
- Background: `bg-danger-600`
- Text: White
- Hover: Darker red
- Shadow: Elevated on hover
- Use: Destructive actions (delete)

### Success (Green)
- Background: `bg-success-600`
- Text: White
- Hover: Darker green
- Shadow: Elevated on hover
- Use: Confirmations, saves

### Secondary (Gray)
- Background: Light gray
- Text: Dark gray
- Hover: Slightly darker
- Use: Toggles, filters

### Ghost (Text Only)
- Background: None
- Text: Gray
- Hover: Light gray fill
- Use: Links, tertiary actions

## States

All buttons automatically support:
- **Hover**: Color changes, shadow increases
- **Active**: Slight scale reduction (0.98) for tactile feedback
- **Disabled**: Opacity 60%, not-allowed cursor
- **Focus**: Blue ring (visible with keyboard nav)

No additional classes needed!

## Examples from the App

### Login Page
```jsx
<button className="btn btn-primary btn-lg w-full">
  Sign In
</button>
```

### Dashboard Logout
```jsx
<button className="btn btn-primary btn-md w-full">
  <LogOut className="h-4 w-4" />
  Logout
</button>
```

### Customer Edit
```jsx
<button className="btn btn-primary btn-md">
  <Edit className="h-4 w-4" />
  Edit
</button>
```

### Action Toolbar
```jsx
<div className="flex items-center gap-2">
  <button className="btn btn-primary btn-sm">
    <PlusSquare className="h-4 w-4" />
    Add Row
  </button>
  <button className="btn btn-outline btn-sm">
    <Upload className="h-4 w-4" />
    Import
  </button>
  <button className="btn btn-danger btn-sm">
    <Trash2 className="h-4 w-4" />
    Delete
  </button>
</div>
```

### Modal Buttons
```jsx
<div className="flex gap-2 justify-end">
  <button className="btn btn-outline btn-md">Cancel</button>
  <button className="btn btn-primary btn-md">Save</button>
</div>
```

## Icon Sizing

All button icons use consistent sizing:
```jsx
<Icon className="h-4 w-4" />  // Standard
<Icon className="h-5 w-5" />  // Larger
<Icon className="h-3 w-3" />  // Smaller
```

## Important Notes

✅ **Do:**
- Combine variant + size: `btn btn-primary btn-md`
- Use predefined classes for everything
- Add `w-full` for full-width buttons
- Use buttons for interactions
- Verify on mobile (44px min touch target)

❌ **Don't:**
- Create custom inline styles
- Use `px-` and `py-` with btn classes
- Override focus-visible states
- Use buttons for page navigation (use `<Link>`)
- Mix different button systems

## Troubleshooting

**Button text not centered?**
- Already handled by `justify-center` in base `.btn` class

**Icon and text not aligned?**
- Already handled by `items-center gap-2` in base class

**Button too wide/narrow?**
- Use `w-full` for full-width
- Use size classes (btn-sm, btn-md, btn-lg, btn-xl)

**Hover state not showing?**
- Variant applied? Check: `btn btn-primary`
- Still having issues? Check browser dev tools for CSS conflicts

**Dark mode looks wrong?**
- All variants include dark mode support
- Check tailwind dark: classes are applied

## File References

- Button classes: `frontend/src/styles/globals.css`
- Reusable component: `frontend/src/components/ui/Button.jsx`
- Full docs: `frontend/BUTTON_DESIGN_SYSTEM.md`

## Quick Migration

**Old way:**
```jsx
<button className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white">
  Save
</button>
```

**New way:**
```jsx
<button className="btn btn-primary btn-md">
  Save
</button>
```

Saves ~30 characters! ✨
