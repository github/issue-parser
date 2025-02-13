import type { Checkboxes, FormattedField } from './types.js';
/**
 * Checks if a response is empty (it is either empty or contains one of the
 * "empty" strings used in issue form responses).
 *
 * @param value Value to Check
 */
export declare function isEmptyResponse(value: string): boolean;
/**
 * Formats an input name to a slugified string.
 *
 * @param name Name to Format
 */
export declare function formatKey(name: string): string;
/**
 * Formats an input value to an appropriate type
 */
export declare function formatValue(input: string, field?: FormattedField): Checkboxes | string[] | string | undefined;
