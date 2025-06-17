import { useFileStoreStore } from "@/stores/auth";
import appconfig from '../../appconfig.json';

export interface FileData {
    name: string;
    description: string | undefined;
    fileBytes: Uint8Array;
}

export interface IFileProvider {
    getFiles(): Array<FileData>;
    getFile(fileName: string): Promise<FileData | undefined>;
    tryGetOpenUrl(ontologyID: string, byIRI?: boolean): Promise<Blob | undefined>;
    getGithubReadme(link: string): Promise<string | undefined>;
}

export class ApiFileProvider implements IFileProvider {
    getFiles(): Array<FileData> {
        throw new Error("Method not implemented.");
    }
    readonly apiPath = appconfig.fileStoreServer;
    readonly authStore = useFileStoreStore();

    async tryGetOpenUrl(ontologyID: string, byIRI: boolean = true): Promise<Blob | undefined> {
        const token = await this.authStore.getToken();
        const url = byIRI
            ? `${this.apiPath}/files/byIRI/${ontologyID}`
            : `${this.apiPath}/files/${ontologyID}`;

        const result = await fetch(url, {
            method: 'GET',
            headers: { authorization: `bearer ${token}` },
        });

        return result.ok
            ? result.blob()
            : undefined;
    }

    async getFile(fileName: string): Promise<FileData | undefined> {
        const token = await this.authStore.getToken();
        const url = `${this.apiPath}/files/${fileName}`;
        const result = await fetch(url, {
            method: 'GET',
            headers: { authorization: `bearer ${token}` },
        });

        if (!result.ok) {
            return undefined;
        }

        return {
            name: fileName,
            description: '',
            fileBytes: await result.bytes(),
        };
    }

    async getGithubReadme(link: string): Promise<string | undefined> {
        const token = await this.authStore.getToken();
        const url = `${this.apiPath}/readme`;

        const response = await fetch(url, {
            method: "POST",
            headers: { authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({link: link})
        });

        if (response.ok) {
            const json = await response.json();

            console.log(json);
            return json.text;
        }

        return undefined;
    }
}

let __fileProvider: IFileProvider | undefined = undefined;
export const getFileProvider = (): IFileProvider => {
    __fileProvider ??= new ApiFileProvider();
    return __fileProvider;
};
