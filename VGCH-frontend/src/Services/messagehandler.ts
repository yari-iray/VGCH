import type { ContactRequest, Submission } from '@/model/MessageModels';
import { useFileStoreStore } from '@/stores/auth';
import appconfig from '../../appconfig.json';

export class MessageHandler {
    private readonly baseUrl = appconfig.fileStoreServer;
    private readonly authStore = useFileStoreStore();

    async createSubmission(submission: Submission): Promise<{ success: boolean; message: string }> {
        const token = await this.authStore.getToken();
        const url = `${this.baseUrl}/submission`;

        const submissionBody = JSON.stringify(submission);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                authorization: `bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: submissionBody,
        });

        const responseBody = await response.json();

        return { success: response.ok, message: responseBody.message };
    }

    async createContactRequest(
        contactRequest: ContactRequest,
    ): Promise<{ success: boolean; message: string }> {
        const token = await this.authStore.getToken();
        const url = `${this.baseUrl}/contact`;

        const body = JSON.stringify(contactRequest);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                authorization: `bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: body,
        });

        const responseBody = await response.json();

        return { success: response.ok, message: responseBody.message };
    }
}
