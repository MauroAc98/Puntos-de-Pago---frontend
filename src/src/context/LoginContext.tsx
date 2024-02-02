import { useRouter } from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";

interface ContextResults {
    setLoginState?: any
    loginState?: string
    addAttempt?: any
    clearAttempts?: any
}

const LoginContext = createContext<ContextResults>({});

interface ContextProps {
    children?: ReactNode
}

const LoginContextProvider = ({ children }: ContextProps) => {
    const router = useRouter();

    const [loginState, setLoginState] = useState('CHECK');
    // Minutos que estara bloqueado para iniciar sesion
    const BLOCK_MINUTES = 1;
    // Intentos permitidos
    const ATTEMPTS_ALLOWED = 3;

    // Añade un nuevo intento de login
    const addAttempt = () => {
        const localAttempts = getAttempts();
        localStorage.setItem("attempts", JSON.stringify(localAttempts + 1));
        // Si el intento es mayor a lo permitido, bloqueamos por x minutos
        if ((localAttempts + 1) > ATTEMPTS_ALLOWED) {
            setLoginState('BLOCKED')
            let currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + BLOCK_MINUTES);
            localStorage.setItem("unlock_date", JSON.stringify(currentDate));
        }
    }

    // Limpia intentos de login
    const clearAttempts = () => {
        localStorage.setItem("attempts", "0");
        setLoginState('CHECK')
    }

    // Obtiene intentos de localStorage, si no existe devuelve 0
    const getAttempts = () => {
        const localAttempts = parseInt(localStorage.getItem('attempts') as string);
        if (!isNaN(localAttempts)) {
            return localAttempts;
        } else {
            return 0;
        }

    }

    const evaluateAttemptBlocked = () => {
        // Fecha en que se debe desbloquear
        let unlockDate = JSON.parse(localStorage.getItem("unlock_date") as string);
        unlockDate = new Date(unlockDate);
        // Fecha actual
        let today: any = new Date();

        // Si todavia no paso el tiempo de bloqueo, lo dejo bloqueado
        if (Date.parse(unlockDate) > Date.parse(today)) {
            setLoginState('BLOCKED');
        } else {
            // Habilito login nuevamente y seteo localStorage
            setLoginState('ENABLED');
            localStorage.setItem("attempts", "0");
            localStorage.removeItem("unlock_date");
        }
    }

    // Obtenemos intentos del localStorage y evaluamos bloqueo
    useEffect(() => {
        if (router.pathname === "/") {
            const localAttempts = getAttempts();
            // Si tiene mas intentos de lo permitido, verificamos
            if (localAttempts > ATTEMPTS_ALLOWED) {
                // Verificamos si ya paso los minutos de bloqueo
                evaluateAttemptBlocked();
            } else {
                setLoginState('ENABLED')
                localStorage.setItem("attempts", JSON.stringify(localAttempts));
            }
        }
    }, [router.pathname])

    const data = {
        setLoginState,
        loginState,
        addAttempt,
        clearAttempts
    };

    return (
        <>
            <LoginContext.Provider value={data}>
                {children}
            </LoginContext.Provider>
        </>
    );
}

export { LoginContextProvider };

export default LoginContext;