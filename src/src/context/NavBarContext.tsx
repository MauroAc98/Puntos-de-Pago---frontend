import { createContext, ReactNode, useEffect, useState } from "react";


interface ContextResults {
    setPageTitle?: any
    pageTitle?: string
    isLogged?: boolean
    userLogged?: any
    setUserLogged?: any
    homeUri?: string
    setHomeUri?: any
    setIsLogged?: any
}

const NavBarContext = createContext<ContextResults>({});

interface ContextProps {
    children?: ReactNode
}

const NavBarContextProvider = ({ children }: ContextProps) => {
    const [pageTitle, setPageTitle] = useState('');
    const [isLogged, setIsLogged] = useState(false);
    const [userLogged, setUserLogged] = useState<any>(null);
    const [homeUri, setHomeUri] = useState('');

    const data = {
        setPageTitle,
        pageTitle,
        isLogged,
        userLogged,
        setUserLogged,
        homeUri,
        setHomeUri,
        setIsLogged,
    };

    return (
        <>
            <NavBarContext.Provider value={data}>
                {children}
            </NavBarContext.Provider>
        </>
    );
}

export { NavBarContextProvider };

export default NavBarContext;