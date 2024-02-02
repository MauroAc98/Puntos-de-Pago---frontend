import { createContext, ReactNode, useRef, useState } from "react";
import { Toast, ToastPositionType } from 'primereact/toast';
import { BlockUI } from 'primereact/blockui';
import { ProgressSpinner } from 'primereact/progressspinner';

interface ContextResults {
    showSuccessMsg?: any
    showErrorMsg?: any
    showInfoMsg?: any
    showWarningMsg?: any
    showBackdropLoader?: any
    hideBackdropLoader?: any
}

const ToastContext = createContext<ContextResults>({});

interface ContextProps {
    children?: ReactNode
}

const ToastContextProvider = ({ children }: ContextProps) => {
    const toast = useRef<any>(null);
    const [position, setPosition] = useState<ToastPositionType>('bottom-right');
    const [blockedDocument, setBlockedDocument] = useState(false);


    const showErrorMsg = (detail: string) => {
        setPosition('bottom-right');
        toast.current.show({ severity: 'error', summary: 'Error', detail: detail, life: 5000 });
    };

    const showSuccessMsg = (detail: string) => {
        setPosition('bottom-right');
        toast.current.show({ severity: 'success', summary: 'Realizado', detail: detail, life: 3000 });
    };

    const showInfoMsg = (detail: string) => {
        setPosition('bottom-right');
        toast.current.show({ severity: 'info', summary: 'Info', detail: detail, life: 3000 });
    };

    const showWarningMsg = (detail: string) => {
        setPosition('bottom-right');
        toast.current.show({ severity: 'warn', summary: 'Advertencia', detail: detail, life: 3000 });
    };

    const showBackdropLoader = () => {
        setBlockedDocument(true);
    }

    const hideBackdropLoader = () => {
        setBlockedDocument(false);
    }

    const data = {
        showErrorMsg,
        showSuccessMsg,
        showInfoMsg,
        showWarningMsg,
        showBackdropLoader,
        hideBackdropLoader
    };

    return (
        <>
            <ToastContext.Provider value={data}>
                <BlockUI blocked={blockedDocument} fullScreen template={<ProgressSpinner />} />
                <Toast ref={toast} position={position} />
                {children}
            </ToastContext.Provider>
        </>
    );
}

export { ToastContextProvider };

export default ToastContext;