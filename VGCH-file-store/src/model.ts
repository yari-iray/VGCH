export interface Token {
  Value: string;
  Expiration: Date;
  IsValid: boolean;
  Level: string;
}


export const submissionTypeOptions = ['Update', 'Missing/incorrect data', 'Copyright', 'Other'] as const;
export type SubmissionType = (typeof submissionTypeOptions)[number];

export interface Submission {
    name: string;
    email: string;
    submission_type: SubmissionType | '';
    message: string;
    date: Date | undefined;
}

export interface ContactRequest {
    name: string;
    email: string;
    message: string;
    date: Date | undefined;
}