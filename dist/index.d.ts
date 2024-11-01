import type { FormattedField, ParsedBody } from './types.js';
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
export declare function parseIssue(issue: string, template?: string, options?: {
    slugify?: boolean;
}): ParsedBody;
/**
 * Parses an issue form template and returns a dictionary of fields. The
 * dictionary is used to match the field types and labels in the issue body. If
 * no template is provided, an empty dictionary is returned.
 *
 * @param template Issue Form Template (YAML String)
 * @returns Parsed Issue Form Template
 * @throws Error if the template is not valid YAML
 */
export declare function parseTemplate(template?: string): {
    [key: string]: FormattedField;
};
