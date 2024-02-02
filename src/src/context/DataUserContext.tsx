import { createContext, ReactNode, useEffect, useState } from "react";


interface ContextResults {
    setDataUser?: any
    dataUser?: any
    setRefreshData?: any,
    refreshData?: any
}

const DataUserContext = createContext<ContextResults>({});

interface ContextProps {
    children?: ReactNode
}

const DataUserContextProvider = ({ children }: ContextProps) => {
    const [dataUser, setDataUser] = useState<any>([]);

    const [refreshData, setRefreshData] = useState({
        deno: '',
        cuit: '',
        data: null
    });

    const data = {
        setDataUser,
        dataUser,
        setRefreshData,
        refreshData
    };


    return (
        <>
            <DataUserContext.Provider value={data}>
                {children}
            </DataUserContext.Provider>
        </>
    );
}

export { DataUserContextProvider };

export default DataUserContext;