# Issue Forms Parser

![Check dist/](https://github.com/github/issue-parser/actions/workflows/check-dist.yml/badge.svg)
![Code Coverage](./badges/coverage.svg)
![CodeQL](https://github.com/github/issue-parser/actions/workflows/codeql.yml/badge.svg)
![Continuous Integration](https://github.com/github/issue-parser/actions/workflows/continuous-integration.yml/badge.svg)
![Continuous Delivery](https://github.com/github/issue-parser/actions/workflows/continuous-delivery.yml/badge.svg)
![Linter](https://github.com/github/issue-parser/actions/workflows/linter.yml/badge.svg)

Convert issue form responses to JSON

## About

This package can be used to parse GitHub issues into machine-readable JSON for
processing. In particular, it is designed to work with
[issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms)
to perform basic transformations on the issue body, resulting in a consistent
JSON output.

Issues submitted using issue forms use a structured Markdown format. **So long
as the issue body is not heavily modified by the user,** we can reliably parse
the issue body into a JSON object.

## Installation

```bash
npm i @github/issue-parser
```

## Example

Here is a simple example of how to use this package in your project.

```typescript
import { parseIssue } from '@github/issue-parser'

const issue = parseIssue('<issue body>', '<template>')
```

Assuming the issue and template look like these examples:

- [Example Issue Markdown](./__fixtures__/example/issue.md)
- [Example Template YAML](./__fixtures__/example/template.yml)

The resulting `issue` object will look like the following:

```typescript
{
  name: 'this-thing',
  nickname: 'thing',
  color: ['blue'],
  shape: ['square'],
  sounds: ['re', 'mi'],
  topics: [],
  description: "This is a description.\n\nIt has multiple lines.\n\nIt's pretty cool!",
  notes: '- Note\n- Another note\n- Lots of notes',
  code: 'const thing = new Thing()\nthing.doThing()',
  'code-string': 'thing.toString()',
  'is-thing': {
    selected: ['Yes'],
    unselected: ['No']
  },
  'is-thing-useful': {
    selected: ['Sometimes'],
    unselected: ['Yes', 'No']
  },
  'read-team': 'IssueOps-Demo-Readers',
  'write-team': 'IssueOps-Demo-Writers'
}
```

## Usage

### `parseIssue`

This is the main function of the package. It takes two arguments:

- `issue: string` - The body of the issue to be parsed
- `template: string` - (Optional) The issue form template used to create the
  issue
- `options?: { slugify?: boolean }` - (Optional) Additional parsing options to
  use when processing the issue body

If the `template` value is provided, the package will attempt to transform the
issue response values into different types based on the `type` property of the
specific field in the template. If the `template` value is omitted, all parsed
values will be returned as strings. For information on the transformations that
are applied, see the [Transformations](#transformations) section.

#### Parsing Options

- `slugify: boolean` - If set to `true`, any parsed keys that are not found in
  the issue forms template (if provided) will be converted to
  [slugs](https://en.wikipedia.org/wiki/Clean_URL#Slug) using the
  [slugify](https://www.npmjs.com/package/slugify) package. Otherwise, the
  original header value will be used as the object key.

### `parseTemplate(template?: string)`

Parses an issue form template and returns an object. This can be used to match
form responses in the issue body with the fields, so that you can perform
additional validation.

When parsing an issue and the associated form template, this package will
attempt to match field IDs with response values. If a match is found, the field
ID will be used in the parsed object keys (instead of the header value from the
markdown response). If no match is found, the header text is used as the object
key.

For example, if you have the following issue form template:

```yaml
name: Example Request
description: Submit an example request
title: '[Request] Example'

body:
  - type: input
    id: name
    attributes:
      label: The Name of the Thing
      description: The name of the thing you want to create.
      placeholder: this-is-the-thing
    validations:
      required: true
```

And the following issue body:

```markdown
### The Name of the Thing

this-thing

### The Nickname of the Thing

thing
```

The resulting parsed issue would be:

```jsonc
{
  // Uses the ID value from the issue form template as the key
  "name": "this-thing",
  // Uses the original header value from the issue body
  "The Nickname of the Thing": "thing"
}
```

## Transformations

The following transformations will take place for responses, depending on the
input type. The type is inferred from the issue form template. For information
on each specific type, see
[Syntax for GitHub's form schema](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema).

### Single Line

[Type: `input`](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#input)

Before:

```plain
This is a response
```

After (no change):

```plain
This is a response
```

### Multiline

[Type: `textarea`](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#textarea)

> [!NOTE]
>
> Empty lines are preserved in multiline responses.

Before:

```plain
First line :D

Third line!
```

After:

```plain
First line :D\n\nThird line!
```

### Dropdown Selections

[Type: `dropdown`](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#dropdown)

Before:

```plain
red, blue, green
```

After:

```json
["red", "blue", "green"]
```

### Checkboxes

[Type: `checkboxes`](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#checkboxes)

Before:

```plain
- [x] Pick me!
- [ ] Don't pick me D:
```

After:

```json
{
  "selected": ["Pick me!"],
  "unselected": ["Don't pick me D:"]
}
```

## Omitting Inputs

In the following situations, an input will be omitted from the output JSON:

| Scenario        | Example                 |
| --------------- | ----------------------- |
| Invalid Heading | `## This is invalid`    |
| Empty Heading   | `###`                   |
|                 | `This is a value`       |
| No Value        | `### This is a heading` |
|                 |                         |
|                 | `### This is another`   |
|                 | `This is a value`       |

Normally, if a form is submitted with empty field(s), they will be included in
the issue body as one of the following, depending on the input type in the form
template.

| Type       | No Response     |
| ---------- | --------------- |
| `dropdown` | `None`          |
| `input`    | `_No response_` |
| `textarea` | `_No response_` |

```markdown
### Dropdown Field

None

### Input or Textarea Field

_No response_

### Checkboxes Field

- [ ] Item A
- [ ] Item B
```

These will be converted to one of the following, based on the type of input
specified in the issue form template:

| Type         | Output                                |
| ------------ | ------------------------------------- |
| `checkboxes` | `{ "selected": [], "unselected": []}` |
| `dropdown`   | `[]`                                  |
| `input`      | `undefined`                           |
| `textarea`   | `undefined`                           |
