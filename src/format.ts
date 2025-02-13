import { EmptyResponse, FieldType } from './enums.js'
import type { Checkboxes, FormattedField } from './types.js'

/**
 * Checks if a response is empty (it is either empty or contains one of the
 * "empty" strings used in issue form responses).
 *
 * @param value Value to Check
 */
export function isEmptyResponse(value: string): boolean {
  return (
    value.toLowerCase() === EmptyResponse.NONE.toLowerCase() ||
    value.toLowerCase() === EmptyResponse.NO_RESPONSE.toLowerCase() ||
    value === ''
  )
}

/**
 * Formats an input name to a slugified string.
 *
 * @param name Name to Format
 */
export function formatKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

/**
 * Formats an input value to an appropriate type
 */
export function formatValue(
  input: string,
  field?: FormattedField
): Checkboxes | string[] | string | undefined {
  // Regex to check if a checkbox is checked.
  const checkedExp: RegExp = /^-\s\[x\]\s/im

  // Remove any whitespace, carriage returns, and leading/trailing newlines.
  const value = input
    .trim()
    .replace(/\r/g, '')
    .replace(/^[\n]+|[\n]+$/g, '')

  if (field === undefined) return value

  // Parse input field types.
  switch (field.type) {
    case FieldType.INPUT:
    case FieldType.TEXTAREA:
      // Return empty string if no response was provided. Otherwise, return the
      // formatted response.
      return isEmptyResponse(value) ? undefined : value
    case FieldType.DROPDOWN:
      // Return empty list if no response was provided. Otherwise, split by
      // commas and return the list.
      return isEmptyResponse(value) ? [] : value.split(/, */)
    case FieldType.CHECKBOXES: {
      // Return empty object if no response was provided. Otherwise, verify
      // which checkboxes are checked and return the object.
      const checkboxes: Checkboxes = {
        selected: [],
        unselected: []
      }

      // Return empty object if no response was provided
      if (isEmptyResponse(value)) return checkboxes

      // Split response by newlines.
      for (let line of value.split('\n')) {
        line = line.trim()

        // Add checked items to selected.
        if (checkedExp.test(line))
          checkboxes.selected.push(line.replace(/-\s\[x\]\s/i, ''))
        // Add unchecked items to unselected.
        else checkboxes.unselected.push(line.replace(/-\s\[\s\]\s/i, ''))
      }

      return checkboxes
    }
    default:
      throw new Error(`Unknown field type: ${field.type}`)
  }
}
