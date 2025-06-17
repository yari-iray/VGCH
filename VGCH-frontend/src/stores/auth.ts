import { defineStore } from 'pinia';
import { ref } from 'vue';
import appconfig from '../../appconfig.json';

export const fileStoreName = 'fileStore';
const fileStoreTokenName = 'fileStoreToken';

export const useFileStoreStore = defineStore(fileStoreName, () => {
    const isAuthenticated = ref(false);
    const token = ref<string | null>(null);
    const baseURL = appconfig.fileStoreServer;

    const initializeStore = () => {
        const storedToken = localStorage.getItem(fileStoreTokenName);
        if (storedToken) {
            token.value = storedToken;
            isAuthenticated.value = true;
        }
    };

    const login = async () => {
        try {
            const loginResponse = await fetch(`${baseURL}/token`, { method: "POST"});
            const tokenValue = (await loginResponse.json()).token;
            token.value = tokenValue;
            localStorage.setItem(fileStoreTokenName, tokenValue);

            isAuthenticated.value = true;
            return true;
        } catch (error) {
            logout();
            throw error;
        }
    };

    const logout = () => {
        token.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem(fileStoreTokenName);
    };

    const getToken = async () => {
        if (!token.value) {
            await login();
        }

        return token.value;
    }

    return {
        token,
        isAuthenticated,
        login,
        logout,
        initializeStore,
        getToken
    };
});
