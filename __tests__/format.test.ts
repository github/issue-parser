import { jest } from '@jest/globals'
import { formatKey, formatValue } from '../src/format.js'
import type { Checkboxes, FormattedField } from '../src/types.js'

describe('formatKey()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Removes non-alphanumeric characters', () => {
    expect(formatKey('!@#$%^&*()_+')).toBe('')
  })

  it('Converts to lowercase', () => {
    expect(formatKey('ABC')).toBe('abc')
  })

  it('Replaces spaces with underscores', () => {
    expect(formatKey('a b c')).toBe('a_b_c')
  })

  it('Replaces multiple consecutive underscores with a single underscore', () => {
    expect(formatKey('a__b__c')).toBe('a_b_c')
  })

  it('Removes leading and trailing underscores', () => {
    expect(formatKey('_abc_')).toBe('abc')
  })

  it('Removes leading and trailing whitespace', () => {
    expect(formatKey(' abc ')).toBe('abc')
  })

  it('Handles empty strings', () => {
    expect(formatKey('')).toBe('')
  })
})

describe('formatValue()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Throws if the type is invalid', () => {
    expect(() => {
      formatValue('ABCDEF', {
        type: 'invalid',
        required: true
      } as unknown as FormattedField)
    }).toThrow('Unknown field type: invalid')
  })

  it('Handles empty strings', () => {
    expect(
      formatValue('', {
        label: 'Input Test',
        type: 'input',
        required: true
      })
    ).toBe('')
  })

  it('Handles None', () => {
    expect(
      formatValue('None', {
        label: 'Dropdown Test',
        type: 'dropdown',
        required: true,
        multiple: false,
        options: ['a', 'b', 'c']
      })
    ).toStrictEqual([])
  })

  it('Handles _No response_', () => {
    expect(
      formatValue('_No response_', {
        label: 'Dropdown Test',
        type: 'dropdown',
        required: true,
        multiple: false,
        options: ['a', 'b', 'c']
      })
    ).toStrictEqual([])
  })

  it('Handles checkboxes', () => {
    const value = `- [ ] a
- [x] b
- [ ] c
- [x] d
- [ ] e`

    const expected: Checkboxes = {
      selected: ['b', 'd'],
      unselected: ['a', 'c', 'e']
    }

    expect(
      formatValue(value, {
        label: 'Checkboxes Test',
        type: 'checkboxes',
        required: true,
        options: [
          { label: 'a', required: false },
          { label: 'b', required: false },
          { label: 'c', required: false }
        ]
      })
    ).toStrictEqual(expected)
  })

  it('Handles no checkboxes', () => {
    const value = ''

    const expected: Checkboxes = {
      selected: [],
      unselected: []
    }

    expect(
      formatValue(value, {
        label: 'Checkboxes Test',
        type: 'checkboxes',
        required: true,
        options: [
          { label: 'a', required: false },
          { label: 'b', required: false },
          { label: 'c', required: false }
        ]
      })
    ).toStrictEqual(expected)
  })

  it('Handles multiline strings', () => {
    const value = `a
b
c`

    expect(
      formatValue(value, {
        label: 'Textarea Test',
        type: 'textarea',
        required: true
      })
    ).toBe(value)
  })
})
