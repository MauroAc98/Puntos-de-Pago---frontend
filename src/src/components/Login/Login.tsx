import { useState, useEffect, useContext } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Loader } from '../Loader/Loader'
import axios from 'axios'
import { setCookie } from 'cookies-next'
import { useRouter } from 'next/router'
import { removeCookies } from '@/services/api'
import md5 from "blueimp-md5";
import LoginContext from '@/context/LoginContext'
import ToastContext from '@/context/ToastContext'
import InlineMessage from '@/components/Message/InlineMessage'
import InputError from '@/components/Error/InputError'
import useCustomForm from '@/hooks/useCustomForm'
import { encryptAes } from '@/services/helpers'


const initialValues = {
    mail: '',
    pass: ''
}

export default function Login() {
    const router = useRouter();
    const { loginState, addAttempt, clearAttempts } = useContext(LoginContext);
    const { showErrorMsg, showInfoMsg } = useContext(ToastContext);
    const [Loading, setLoading] = useState(false);
    const { formData, formErrors, setFormErrors, handleFormChange } = useCustomForm(initialValues)

    // Validacion de formulario
    const validateForm = () => {
        let valid = true;
        if (formData.mail == "") {
            valid = false;
            setFormErrors((prevErrors: any) => (
                { ...prevErrors, mail: "Ingrese usuario" }
            ))
        }

        if (formData.pass == "") {
            valid = false;
            setFormErrors((prevErrors: any) => (
                { ...prevErrors, pass: "Ingrese contraseña" }
            ));
        }

        return valid;
    }

    function verifyRouteParam(data: any) {
        if (router.query?.redirect_to) {
            const url: any = router.query.redirect_to;
            router.push(url);
            return;
        }
        if (data.entorno === 'EXT') {
            router.push('/apps/dashboard');
        } else {
            router.push('/apps/consultar-cep');
        }
    }


    async function sendLogin(e: any) {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            try {

                let encodedUser = encryptAes(formData.mail);
                let encodedPass = encryptAes(md5(formData.pass));

                let qs = require('qs');
                const params = qs.stringify({
                    'user': encodedUser,
                    'password': encodedPass
                });

                let config = {
                    method: 'post',
                    maxBodyLength: Infinity,
                    url: `${process.env.urlback}/framework/login`,
                    headers: {
                        'cli': process.env.cli,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    withCredentials: true,
                    data: params
                };

                const { data } = await axios(config);
                if (data.state === 'OK') {
                    setCookie('user', data.userName);
                    // Limpiamos intentos
                    clearAttempts();
                    verifyRouteParam(data);
                }
            } catch (error: any) {
                if (error.name === "AxiosError" && error.response?.data?.state === "NO_OK") {
                    showErrorMsg('Credenciales incorrectas');
                    // Sumamos intento de login
                    addAttempt();
                } else {
                    if (error.name === "AxiosError" && error.response?.data?.msj) {
                        showErrorMsg(error.response?.data?.msj);
                    } else {
                        showErrorMsg("Ocurrió un problema. Intente de nuevo.");
                    }
                }
            }
            setLoading(false);
        }

    }



    function showNotif(message: string, type: string) {

        switch (type) {
            case 'info':
                showInfoMsg(message)
                break;
            case 'error':
                showErrorMsg(message)
                break;

        }
        removeCookies();
    }

    useEffect(() => {
        if (router.query.requiredlog === 'true') {
            showNotif('Inicie sesión para acceder a la página', 'info');
        }
    }, [router.query.requiredlog])
    useEffect(() => {
        if (router.query.environmenterror === 'true') {
            showNotif('Acción prohibida, por favor ingrese nuevamente al sistema.', 'error');
        }
    }, [router.query.environmenterror])

    useEffect(() => {
        sessionStorage.clear();
    }, [])


    return (
        <>
            <div className='fadein lg:col-3 col-12 lg:border-1 border-400 p-0 lg:shadow-2 lg:border-round'>
                {Loading && <Loader />}

                <form onSubmit={sendLogin} className='p-3'>
                    <div className='flex justify-content-center'>
                        <img className='flex justify-content-center' src='/ATM.jpg' alt="ATM Misiones" width={200} height={200} />
                    </div>
                    <span className='p-input-icon-left w-full'>
                        <i className="pi pi-user"></i>
                        <InputText value={formData.mail} placeholder='Usuario' name='mail' onChange={handleFormChange} className='p-inputtext-sm w-full' />
                    </span>
                    <div className='mt-2'>
                        <InputError name="mail" text={formErrors.mail} />
                    </div>
                    <span className='p-input-icon-left w-full mt-3'>
                        <i className="pi pi-lock"></i>
                        <InputText value={formData.pass} placeholder='Contraseña' name='pass' onChange={handleFormChange} type={'password'} className='p-inputtext-sm w-full shadow' />
                    </span>
                    <div className='mt-2'>
                        <InputError name="pass" text={formErrors.pass} />
                    </div>

                    {(loginState === 'ENABLED') && (
                        <Button className='w-full p-button-sm mt-3' label="Ingresar" />
                    )}

                    {(loginState === 'BLOCKED') && (
                        <InlineMessage
                            severity='warn'
                            detail='Demasiados intentos de inicio de sesión. Espere unos minutos y vuelva a recargar la página.'
                            closable={false}
                        />
                    )}

                    <div className='text-xs text-center mt-3 text-700 mb-2 cursor-pointer' onClick={() => router.push('/apps/pagar-cep')}>Acceder sin iniciar sesión</div>
                </form>
            </div>
        </>
    );
}
