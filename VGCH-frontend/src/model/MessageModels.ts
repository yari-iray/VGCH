export const submission_type_options = ['Update', 'Missing/incorrect data', 'Copyright', 'Other'] as const;
export type SubmissionType = (typeof submission_type_options)[number];

export interface Submission {
    name: string;
    email: string;
    submission_type: SubmissionType | '';
    message: string;
}

export interface ContactRequest {
    name: string;
    email: string;
    message: string;
}

