import axios from 'axios';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import jwt_decode from "jwt-decode";

const api = () => {
    const defaultOptions = {
        baseURL: `${process.env.urlback}`,
        headers: {
            'cli': process.env.cli,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    };

    /** Creamos instancia */
    let instance = axios.create(defaultOptions);

    /** Acciones antes de realizar una peticion */
    instance.interceptors.request.use(async function (config: any) {
        // Verificacion por typescript
        if (config.headers === undefined) {
            config.headers = {};
        }

        // Agregar withCredentials: true a los encabezados
        config.withCredentials = true;

        return config;
    }, error => {
        return Promise.reject(error);
    });

    /** Acciones luego de obtener una respuesta */
    instance.interceptors.response.use(
        function (response: any) {            

            // Verificacion por typescript
            if (response.headers === undefined) {
                response.headers = {};
            }

            return response;
        },
        function (error) {
            const errorResponse = error.response;
            // Unauthorized
            if (errorResponse.status === 401) {
                removeCookies();
                return window.location.href = `${process.env.urlfront}/`;
            }
            // Si es un codigo diferente al 401, retornamos los errores
            return Promise.reject(error);
        }
    );

    return instance;
};

export const removeCookies = () => {
    deleteCookie('user');
    deleteCookie('userSelect');
};

export const decodeAccessToken = () => {
    try {
        let token: any = getCookie('accessToken');
        let decoded = jwt_decode(token);
        return decoded;
    } catch (error) {
        throw new Error('invalid_token');
    }
}


export default api();
