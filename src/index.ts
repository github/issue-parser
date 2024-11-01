import yaml from 'yaml'
import { FieldType } from './enums.js'
import { formatKey, formatValue } from './format.js'
import type {
  Checkboxes,
  CheckboxesField,
  DropdownField,
  FormattedField,
  InputField,
  ParsedBody
} from './types.js'

/**
 * Parses an issue body (Markdown string) and returns a dictionary of the parsed
 * fields. Uses the issue form template (optional YAML string) to match field
 * types and labels. If the issue form template is not provided, the function
 * will use the field header text as the key in the parsed body.
 *
 * @param issue Issue Body (Markdown String)
 * @param template Issue Form Template (YAML String)
 * @param options Additional Processing Options
 * @returns Parsed Issue Body
 */
export function parseIssue(
  issue: string,
  template?: string,
  options?: { slugify?: boolean }
): ParsedBody {
  const parsedTemplate: { [key: string]: FormattedField } =
    parseTemplate(template)

  const parsedIssue: {
    [key: string]: Checkboxes | string[] | string | undefined
  } = {}

  // Match the sections of the issue body
  const regexp = /### *(?<key>.*?)\s*[\r\n]+(?<value>[\s\S]*?)(?=\n?###|\n?$)/g
  const matches = issue.matchAll(regexp)

  for (const match of matches) {
    let value: Checkboxes | string[] | string | undefined =
      match.groups?.value || undefined
    let key: string | undefined = match.groups?.key || ''

    // Skip malformed sections
    if (key === undefined || key === '' || value === undefined || value === '')
      continue

    // If the slugify option is enabled, format the key.
    if (options?.slugify) key = formatKey(key)

    // If the form template was provided, use the key from there instead of the
    // heading in the issue body.
    for (const [k, v] of Object.entries(parsedTemplate)) {
      if (formatKey(v.label) === key || v.label === key) {
        key = k
        break
      }
    }

    // Format the value (returns null if the value couldn't be parsed)
    value = formatValue(value, parsedTemplate[key])

    // Add to the parsed issue body
    parsedIssue[key] = value
  }

  // Return the dictionary
  return parsedIssue
}

/**
 * Parses an issue form template and returns a dictionary of fields. The
 * dictionary is used to match the field types and labels in the issue body. If
 * no template is provided, an empty dictionary is returned.
 *
 * @param template Issue Form Template (YAML String)
 * @returns Parsed Issue Form Template
 * @throws Error if the template is not valid YAML
 */
export function parseTemplate(template?: string): {
  [key: string]: FormattedField
} {
  // If the template was not provided, return an empty object.
  if (!template) return {}

  // Parse the template and confirm the type/properties are valid.
  const fields = yaml.parse(template)

  if (typeof fields !== 'object')
    throw new Error('Issue template could not be parsed into an object.')
  if (!Array.isArray(fields.body))
    throw new Error('Issue template is missing a body array property.')

  const parsedTemplate: { [key: string]: FormattedField } = {}

  for (const item of fields.body) {
    // Skip markdown fields.
    if (item.type === FieldType.MARKDOWN) continue

    // Check if the ID is present in the field attributes. If so, use it as the
    // key. Otherwise, convert the label to snake case (this is the heading in
    // the issue body when the form is submitted).
    const key: string =
      item.id || formatKey((item as InputField).attributes.label)

    // Take the rest of the attributes and add them to the object
    parsedTemplate[key] = {
      type: item.type,
      label: (item as InputField).attributes.label,
      required: (item as InputField).validations?.required || false
    }

    // Parse fields only used by dropdowns.
    if (item.type === FieldType.DROPDOWN) {
      parsedTemplate[key].multiple =
        (item as DropdownField).attributes.multiple || false
      parsedTemplate[key].options = (item as DropdownField).attributes.options
    }

    // Parse fields only used by checkboxes.
    if (item.type === FieldType.CHECKBOXES) {
      // Checkboxes have a different options format than dropdowns.
      parsedTemplate[key].options = (
        item as CheckboxesField
      ).attributes.options.map((x) => {
        return { label: x.label, required: x.required || false }
      })
    }
  }

  return parsedTemplate
}
