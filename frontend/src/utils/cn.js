/**
 * Utility function to merge classNames conditionally
 * Removes falsy values and duplicates
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .split(' ')
    .filter((cls, idx, arr) => cls && arr.indexOf(cls) === idx)
    .join(' ')
}
