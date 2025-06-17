import { put, getDownloadUrl } from '@vercel/blob'
import { ContactRequest, Submission } from './model';

type RequestItem = ContactRequest | Submission;

export class Synchronizer {
    async upload(item: RequestItem): Promise<boolean> {
        const fileBase = ('submission_type' in item) ? "Submission" : "ContactRequest";
        const uuid = crypto.randomUUID();

        const fileName = `${fileBase} ${new Date()} ${uuid}.json`;

        try {
            const result = await put(fileName, JSON.stringify(item), {  multipart: false, access: "public" });
            return (result.downloadUrl) !== undefined && (result.downloadUrl.trim().length > 0);
        }
        catch (err) {
            console.error(err);
            return false;
        }        
    }
}