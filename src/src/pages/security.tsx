import { Loader } from '@/components/Loader/Loader'
import api, { removeCookies } from '@/services/api';
import { useContext, useEffect, useState } from "react";
import ToastContext from "@/context/ToastContext";
import { decodeAccessToken } from "@/services/api";
import { getCookie, setCookie } from 'cookies-next';
import jwt_decode from "jwt-decode";
import axios from "axios";
import { decode } from 'js-base64'
import { useRouter } from 'next/router';
import NavBarContext from '@/context/NavBarContext';
import { isAlive } from '@/services/isAliveService';

export default function Security(props?: any) {
    const router = useRouter();
    const [Loading, setLoading] = useState(false);
    const { showErrorMsg } = useContext(ToastContext);
    const { setUserLogged, setIsLogged } = useContext(NavBarContext);

    const log = (msj: string) => {
        console.log(msj);
    }

    const validateAccess = async (authorization_code: any) => {
        log('validateAccess')
        if (!authorization_code) {
            log('authorization_code no valido')
            revokeAccess();
        } else {
            log('validando securityToken')
            setLoading(true);

            let result: any = await validateAutorizationCode(authorization_code);

            // Si la validacion de auth code nos devuelve error, eliminamos cookies y redirigimos a login
            if (result.error != null) {
                log('authorization_code: ' + result.message)
                revokeAccess();
                return;
            }

            // Datos que traemos del auth code
            let userSecurity = decode(result.params.user);
            let userNameSecurity = decode(result.params.name);
            let cliSecurity = decode(result.cli);
            let tokenSecurity = result.token;
            let urlRedirectSecurity = result.redirect_uri;

            try {
                const cookieData = await getCookieData();

                let urlRedirectToken = cookieData.home;
                let userToken = cookieData.user;

                console.log("userToken", userToken);
                console.log("urlRedirectToken", urlRedirectToken);
                console.log("userSecurity", userSecurity);
                console.log("urlRedirectSecurity", urlRedirectSecurity);




                log('comparando datos de token')
                if (userToken === userSecurity && urlRedirectToken === urlRedirectSecurity) {
                    log('isAlive')
                    // Ejecuto isAlive comun
                    const data: any = isAlive("/security");

                    // Si mi respuesta es OK, redirijo al home, el back con el middleware se encarga de refrescar token si es necesario
                    if (data.state == "OK") {
                        log('token valido')
                        log('redirect dashboard')
                        setLoading(false);
                        router.push(urlRedirectSecurity);
                    } else {
                        log('accessToken invalido')
                        validateSecurityToken(cliSecurity, tokenSecurity, urlRedirectSecurity);
                    }
                } else {
                    log('datos de token diferentes')
                    validateSecurityToken(cliSecurity, tokenSecurity, urlRedirectSecurity);
                }
            } catch (e) {
                log('accessToken no encontrado o invalido :: ' + e)
                validateSecurityToken(cliSecurity, tokenSecurity, urlRedirectSecurity);
            }
        }
    }

    const decodeSecurityToken = () => {
        try {
            let decoded = jwt_decode(props.securityToken);
            return decoded;
        } catch (error) {
            throw new Error('invalid_security_token');
        }
    }

    const revokeAccess = async () => {
        log('revokeAccess');
        try {
            // Eliminamos cookie HTTPONLY y datos del front
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.urlback}/framework/security/del_cookie`,
                headers: {
                    'cli': process.env.cli
                }
            };
            await axios(config);

            // Si todo esta OK
            setLoading(false);
            removeCookies();
            setUserLogged(null);
            setIsLogged(false);
            showErrorMsg('Inconvenientes en verificación de seguridad, identifíquese nuevamente.');
            router.push('/');
        } catch (error) {
            showErrorMsg('Inconvenientes en revocar acceso, identifíquese nuevamente.');
            router.push('/');
        }
    }

    const validateAutorizationCode = async (code: string) => {
        try {
            let value = new FormData();
            value.append('response_type', 'authorization_code');
            value.append('code', code);
            value.append('state', genState());

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.urlback}/oauth/authorize`,
                data: value
            };
            const { data } = await axios(config);

            return data;
        } catch (error: any) {
            log('catch securityToken :: ' + error)
            return {
                error: error?.response?.data?.error,
                message: error?.response?.data?.message
            }
        }
    }

    const genState = () => {
        // Obtener la fecha y hora actual
        const fechaHora = new Date();

        // Convertir la fecha y hora a un formato legible para un código
        const dia = fechaHora.getDate().toString().padStart(2, '0');
        const mes = (fechaHora.getMonth() + 1).toString().padStart(2, '0');
        const anio = fechaHora.getFullYear().toString().substr(-2);
        const hora = fechaHora.getHours().toString().padStart(2, '0');
        const minutos = fechaHora.getMinutes().toString().padStart(2, '0');
        const segundos = fechaHora.getSeconds().toString().padStart(2, '0');

        // Generar un código único utilizando la fecha y hora actual
        const codigo = `${dia}${mes}${anio}${hora}${minutos}${segundos}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        return codigo;
    }

    // const isAlive = async () => {
    //     try {
    //         const cli: any = process.env.cli;
    //         const response = await fetch(`${process.env.urlback}/is_alive`, {
    //             headers: {
    //                 'cli': cli,
    //                 'Authorization': `Bearer ${getCookie('accessToken')}`
    //             }
    //         });

    //         const refreshToken = response.headers.get('accesstoken') ? response.headers.get('accesstoken') : null;
    //         const data = await response.json();

    //         if (data?.state === 'OK') {
    //             return {
    //                 state: "OK",
    //                 refreshToken: refreshToken
    //             };
    //         } else {
    //             return {
    //                 state: "NOOK"
    //             };
    //         }
    //     } catch (error) {
    //         return {
    //             state: "ERROR"
    //         };
    //     }
    // }

    const validateSecurityToken = async (cli: string, token: string, redirectUri: string) => {
        try {
            // Creo Token HTTPONLY con los datos del token de auth code
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.urlback}/framework/security`,
                headers: {
                    'cli': cli,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true //para que setee cookie en servidor
            };
            const { data } = await axios(config);

            if (data.state === 'OK') {
                log('securityToken Valido')

                setCookie('user', data.userName);
                setLoading(false);
                log('redirigiendo a: ' + redirectUri);
                router.push(redirectUri);
            } else {
                log('securityToken invalido')
                revokeAccess();
            }
        } catch (error) {
            log('catch securityToken :: ' + error)
            revokeAccess();
        }
    }

    const getCookieData = async () => {
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${process.env.urlback}/framework/security/get_cookie_data`,
                headers: {
                    'cli': process.env.cli
                },
                withCredentials: true //para poder acceder a los datos de cookie
            };
            const { data } = await axios(config);

            return data;
        } catch (error) {
            throw new Error("Error en get_cookie_data");
        }
    }

    useEffect(() => {
        if (router.isReady) {
            const { authorization_code } = router.query;
            validateAccess(authorization_code);
        }
    }, [router]);

    return (
        <>
            {Loading && <Loader />}
            <div className="h-screen flex justify-content-center align-items-center">
                <div className='fadein lg:col-3 col-12 lg:border-1 border-400 p-0 lg:shadow-2 lg:border-round p-3'>
                    <div className='flex justify-content-center'>
                        <img className='flex justify-content-center' src='/search-security.png' alt="Verificando Seguridad" width={150} height={150} />
                    </div>
                    <div className='text-xs text-center mt-3 text-700 mb-2 cursor-pointer'>Analizando credenciales, aguarde un momento y será redireccionado a la brevedad.</div>
                </div>
            </div>
        </>
    );
}