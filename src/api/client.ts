import { authApi } from './auth';

// Mock refreshOnce
export async function refreshOnce(): Promise<string | null> {
    try {
        const res = await authApi.refresh();
        if (res.success) {
            return res.data.accessToken;
        }
        return null;
    } catch {
        return null;
    }
}

// Mock apiClient (should not be used if all APIs are mocked, but just in case)
export const apiClient = {
    get: async () => { throw new Error('Unexpected API call'); },
    post: async () => { throw new Error('Unexpected API call'); },
    put: async () => { throw new Error('Unexpected API call'); },
    patch: async () => { throw new Error('Unexpected API call'); },
    delete: async () => { throw new Error('Unexpected API call'); },
    interceptors: {
        request: { use: () => { } },
        response: { use: () => { } }
    }
};

export default apiClient;
