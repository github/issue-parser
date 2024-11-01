import { jest } from '@jest/globals'
import fs from 'fs'

const { parseIssue, parseTemplate } = await import('../src/index.js')

describe('parseIssue()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Parses a blank issue', () => {
    const issue = fs.readFileSync('__fixtures__/blank/issue.md', 'utf8')
    const template = fs.readFileSync('__fixtures__/blank/template.yml', 'utf8')

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/blank/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an example request', () => {
    const issue = fs.readFileSync('__fixtures__/example/issue.md', 'utf8')
    const template = fs.readFileSync(
      '__fixtures__/example/template.yml',
      'utf8'
    )

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/example/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an invalid issue', () => {
    const issue = fs.readFileSync('__fixtures__/invalid/issue.md', 'utf8')
    const template = fs.readFileSync(
      '__fixtures__/invalid/template.yml',
      'utf8'
    )

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/invalid/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an issue with missing data', () => {
    const issue = fs.readFileSync('__fixtures__/missing/issue.md', 'utf8')
    const template = fs.readFileSync(
      '__fixtures__/missing/template.yml',
      'utf8'
    )

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/missing/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an issue with missing headers', () => {
    const issue = fs.readFileSync('__fixtures__/header/issue.md', 'utf8')
    const template = fs.readFileSync('__fixtures__/header/template.yml', 'utf8')

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/header/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an issue with extra fields', () => {
    const issue = fs.readFileSync('__fixtures__/extra/issue.md', 'utf8')
    const template = fs.readFileSync('__fixtures__/extra/template.yml', 'utf8')

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/extra/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })

  it('Parses an issue without IDs in fields', () => {
    const issue = fs.readFileSync('__fixtures__/no-ids/issue.md', 'utf8')
    const template = fs.readFileSync('__fixtures__/no-ids/template.yml', 'utf8')

    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/no-ids/parsed-issue.json', 'utf8')
    )

    const result = parseIssue(issue, template)
    expect(result).toEqual(expected)
  })
})

describe('parseTemplate()', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Parses a template with IDs', () => {
    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/example/parsed-template.json', 'utf8')
    )

    const result = parseTemplate(
      fs.readFileSync('__fixtures__/example/template.yml', 'utf8')
    )
    expect(result).toEqual(expected)
  })

  it('Parses a template without IDs', () => {
    const expected = JSON.parse(
      fs.readFileSync('__fixtures__/no-ids/parsed-template.json', 'utf8')
    )

    const result = parseTemplate(
      fs.readFileSync('__fixtures__/no-ids/template.yml', 'utf8')
    )
    expect(result).toEqual(expected)
  })

  it('Throws if the template is not a valid YAML object', () => {
    expect(() => {
      parseTemplate('invalid')
    }).toThrow('Issue template could not be parsed into an object.')
  })

  it('Throws if the template does not have a body list field', () => {
    expect(() => {
      parseTemplate('title: Test')
    }).toThrow('Issue template is missing a body array property.')
  })

  it('Returns an empty object if no template is provided', () => {
    expect(parseTemplate()).toMatchObject({})
  })
})
