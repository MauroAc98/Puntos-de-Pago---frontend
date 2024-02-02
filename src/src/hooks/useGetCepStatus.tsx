
import ToastContext from '@/context/ToastContext';
import api from '@/services/api';
import { useContext } from 'react';

export default function useGetCepStatus(onSuccess: any) {
    const { showErrorMsg } = useContext(ToastContext);

    const getStatus = async () => {
        try {
            const { data } = await api.get("/get_ceps_status");

            onSuccess(data);

        } catch (error) {
            showErrorMsg(error);
        }
    }

    return {
        getStatus
    }
}