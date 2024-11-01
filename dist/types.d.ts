/** GitHub Issue Form Template */
export type IssueFormTemplate = {
    name: string;
    description: string;
    body: (MarkdownField | TextareaField | InputField | DropdownField | CheckboxesField)[];
    assignees?: string[];
    labels?: string[];
    title?: string;
    projects?: string[];
};
/** GitHub Issue Forms Markdown Field */
export type MarkdownField = {
    type: 'markdown';
    id?: string;
    attributes: {
        value: string;
    };
};
/** GitHub Issue Forms Textarea Field */
export type TextareaField = {
    type: 'textarea';
    id?: string;
    attributes: {
        label: string;
        description?: string;
        placeholder?: string;
        value?: string;
        render?: string;
    };
    validations?: {
        required?: boolean;
    };
};
/** GitHub Issue Forms Input Field
 */
export interface InputField {
    type: 'input';
    id?: string;
    attributes: {
        label: string;
        description?: string;
        placeholder?: string;
        value?: string;
    };
    validations?: {
        required?: boolean;
    };
}
/** GitHub Issue Forms Dropdown Field */
export interface DropdownField {
    type: 'dropdown';
    id?: string;
    attributes: {
        label: string;
        description?: string;
        multiple?: boolean;
        options: string[];
    };
    validations?: {
        required?: boolean;
    };
}
/** GitHub Issue Forms Checkboxes Field */
export interface CheckboxesField {
    type: 'checkboxes';
    id?: string;
    attributes: {
        label: string;
        description?: string;
        options: {
            label: string;
            required?: boolean;
        }[];
    };
    validations?: {
        required?: boolean;
    };
}
/** Formatted GitHub Issue Forms Field */
export interface FormattedField {
    id?: string;
    label: string;
    type: 'markdown' | 'textarea' | 'input' | 'dropdown' | 'checkboxes';
    required: boolean;
    multiple?: boolean;
    options?: (string | {
        label: string;
        required: boolean;
    })[];
}
/** Parsed Checkboxes Input */
export interface Checkboxes {
    selected: string[];
    unselected: string[];
}
/** Parsed Issue Body */
export interface ParsedBody {
    [key: string]: Checkboxes | string[] | string | undefined;
}
