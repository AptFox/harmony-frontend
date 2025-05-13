import { Dispatch, SetStateAction } from "react";

export type AuthContextType = {
    accessToken: string | undefined,
    accessTokenIsLoading: boolean,
    setAccessToken: (accessToken: string | undefined) => void,
    login: () => void;
    logout: () => void;
}

// TODO: maybe get rid of this
// export interface AuthError extends Error {
//     info: {
//         error: string;
//         path: string;
//         status: number;
//         timestamp: string;
//     }
// }