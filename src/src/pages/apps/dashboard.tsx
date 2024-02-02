import DashboardCard from "@/components/Dashboard/DashboardCard";
import { useContext, useEffect, useState } from "react";
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import NavBarContext from "@/context/NavBarContext";
import api from "@/services/api";
import ErrorResult from "@/components/Error/ErrorResult";
import DataUserContext from "@/context/DataUserContext";
import ToastContext from "@/context/ToastContext";
import qs from "qs";
import { Button } from 'primereact/button';
import CustomDialogEspera from "@/components/CustomDialog/CustomDialogEspera";
import { Loader } from "@/components/Loader/Loader";
import { useRouter } from 'next/router';

export interface DashboardData {
    idSession: number;
    state: string;
    message: string;
    data: {
        n_cuit: string;
        d_denominacion: string;
        default: "S" | "N";
    }[];
    totalDebt: number;
    compositionDebt: {
        percentageDebt: string;
        groupDebt: string;
        nameDebt: string;
        amountGroup:string
    }[];
}

export default function Dashboard(): JSX.Element {
    const { setPageTitle } = useContext(NavBarContext);
    const { setDataUser } = useContext(DataUserContext);
    const [loading, setLoading] = useState(true);
    const [dataDashboar, setDataDashboar] = useState<DashboardData>({
        idSession: 0, state: '',
        message: '',
        data: [],
        totalDebt: 0,
        compositionDebt: [],
    });
    const { showErrorMsg } = useContext(ToastContext);
    const router = useRouter();
    const [dialogData, setDialogData] = useState({
        open: false,
        title: "ATENCIÓN",
        message: "",
        p_m_demora: "",
    });

    const [emptyDash, setEmptyDash] = useState(true);
    const [success, setSuccess] = useState(false);
    const getDashboardData = async () => {
        try {
            setLoading(true);
            const params = qs.stringify({
                p_m_acepta_esperar: dialogData.p_m_demora === 'S' ? 'S' : 'N'
            })
            const { data }: any = await api.post('/getDataUser', params);
            if (data.state !== 'OK') {
                setEmptyDash(false);
                setSuccess(false);
                showErrorMsg("Ocurrió un problema. Intente de nuevo.");
            } else {
                if (data.p_m_demora === 'S') {
                    setDialogData({ ...dialogData, open: true, message: data.message, p_m_demora: data.p_m_demora })
                } else {
                    setDataUser(data.data)
                    setDataDashboar(data);
                    setSuccess(true);
                }
            }
        } catch (error) {
            setSuccess(false);
        } finally {
            setLoading(false);
        }
    }

    const onStay = () => {
        getDashboardData();
        setDialogData({ ...dialogData, open: false })
    }

    const footerContent = (
        <div>
            <Button label="Permanecer Aquí" onClick={onStay} className="p-button-text p-button-danger" />
            <Button label="Generar BEP" className="button-pdp" onClick={() => router.push("/apps/generar-cep?refresh=SI","/apps/generar-cep")} />
        </div>
    );

    useEffect(() => {
        getDashboardData();
        setPageTitle('')
    }, [])



    return (
        <>

            <CustomDialogEspera title={dialogData.title} message={dialogData.message} open={dialogData.open} footer={footerContent} setDialogData={setDialogData} dialogData={dialogData} />

            {loading && (
                <>
                    <Loader />
                    <DashboardSkeleton />
                </>
            )}

            {!loading && success && (

                <DashboardCard
                    userData={dataDashboar}
                />
            )}

            {!loading && dialogData.p_m_demora != 'S' && !success && emptyDash && (
                <ErrorResult />
            )}
        </>
    )
}