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
  // Match the sections of the issue body
  const regexp = /### *(?<key>.*?)\s*[\r\n]+(?<value>[\s\S]*?)(?=\n?###|\n?$)/g
  const matches = issue.matchAll(regexp)

  // Create an empty dictionary to store the parsed issue body.
  const parsedIssue: {
    [key: string]: Checkboxes | string[] | string | undefined
  } = {}

  if (template) {
    const parsedTemplate = parseTemplate(template)

    // If the form template was provided, iterate over the matches and confirm
    // there is a corresponding form field. If not, that match should be combined
    // with the previous match.
    const parsedMatches = []

    for (const match of matches) {
      if (
        match.groups?.key === undefined ||
        match.groups?.value === undefined ||
        match.groups?.key === '' ||
        match.groups?.value === ''
      )
        continue

      // If the key is in the template, add it to the parsed matches.
      if (
        Object.values(parsedTemplate).some(
          (field) => field.label === match.groups!.key
        )
      ) {
        parsedMatches.push(match)
        continue
      }

      // If this is the first match, we have to drop it because there is no
      // previous match to append it to.
      /* istanbul ignore if */
      if (parsedMatches.length === 0) continue

      // Append the full content to the most recent match.
      parsedMatches[parsedMatches.length - 1].groups!.value =
        parsedMatches[parsedMatches.length - 1].groups!.value + '\n' + match[0]
    }

    for (const match of parsedMatches) {
      let key = match.groups!.key
      const value: Checkboxes | string[] | string | undefined =
        match.groups!.value

      // If the form template was provided, use the key from there instead of
      // the heading in the issue body.
      for (const [k, v] of Object.entries(parsedTemplate))
        if (v.label === key) {
          key = k
          break
        }

      // Add to the parsed issue body
      parsedIssue[key] = formatValue(value, parsedTemplate[key])
    }
  } else {
    // No template was provided. Use the field header text as the key.
    for (const match of matches) {
      /* istanbul ignore if */
      if (
        match.groups?.key === undefined ||
        match.groups?.value === undefined ||
        match.groups?.key === '' ||
        match.groups?.value === ''
      )
        continue

      let key = match.groups.key
      const value: Checkboxes | string[] | string | undefined =
        match.groups.value

      // If the slugify option is enabled, format the key. Otherwise, use the
      // field header text as the key.
      if (options?.slugify) key = formatKey(key)

      // Add to the parsed issue body
      parsedIssue[key] = formatValue(value)
    }
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

export { FieldType } from './enums.js'
export type {
  Checkboxes,
  CheckboxesField,
  DropdownField,
  FormattedField,
  InputField,
  ParsedBody
} from './types.js'
