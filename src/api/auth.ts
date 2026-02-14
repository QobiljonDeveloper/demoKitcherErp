import { delay } from './mockUtils';

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    data: {
        accessToken: string;
    };
}

export interface UserResponse {
    success: boolean;
    data: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
}

const MOCK_TOKEN = 'demo-token-12345';
const MOCK_USER = {
    id: 'user-1',
    email: 'admin@kitchen.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
};

export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        await delay(500);
        if (data.email && data.password) {
            return {
                success: true,
                data: {
                    accessToken: MOCK_TOKEN,
                },
            };
        }
        throw new Error('Invalid credentials');
    },

    logout: async (): Promise<void> => {
        await delay(200);
    },

    getMe: async (): Promise<UserResponse> => {
        await delay(300);
        return {
            success: true,
            data: MOCK_USER,
        };
    },

    refresh: async (): Promise<LoginResponse> => {
        await delay(200);
        return {
            success: true,
            data: {
                accessToken: MOCK_TOKEN,
            },
        };
    },
};

export default authApi;
