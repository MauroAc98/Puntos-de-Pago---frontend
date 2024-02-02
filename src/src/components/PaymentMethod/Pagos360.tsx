import { useContext, useEffect, useState } from "react";
import { Loader } from '../../components/Loader/Loader';
import api from "@/services/api";
import { Dialog } from 'primereact/dialog';
import qs from "qs";
import CartContext from "@/context/CartContext";
import ToastContext from "@/context/ToastContext";
import { ProgressBar } from 'primereact/progressbar';
import { useRouter } from 'next/router';

interface Pagos360 {
    DataEntity: any,
    item: any
}

export default function Pagos360({
    DataEntity, item
}: Pagos360) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [windowOpen, setWindowOpen] = useState(false);
    const [blockDialogData, setBlockDialogData] = useState({
        c_estado_pago: "initial",
        mensajeDialog: "",
        detailMensaje: "Al finalizar la solicitud por favor cierre la pestaña de la plataforma de 360 y aguarde mientras procesamos su pago.",
        titleDialog: "Solicitud de Débito - Pagos360",
        open: false,
        closable: false
    });

    const { showErrorMsg } = useContext(ToastContext);

    const { id_session_db, onRenderJsonEntity, verifyCeps } = useContext(CartContext);

    const [responseData360, setResponseData360] = useState({
        id: 0,
        n_id_solicitud: 0,
        checkout_url: {
        }
    });

    const recoverUrlSandBox = async () => {
        await updateFinalRecords();

        setLoading(true);

        try {
            setBlockDialogData({
                ...blockDialogData,
                c_estado_pago: "loading",
                mensajeDialog: "Ingresando a la plataforma de Pagos360",
                titleDialog: "ATENCIÓN",
                open: true,
                closable: false
            });
            const numCepsArray = [];
            for (const cep of DataEntity.ceps) {
                numCepsArray.push(cep.num_cep);
            }
            const parametros = qs.stringify({
                'p_id_sesion': parseInt(id_session_db),
                'p_c_entity_group': DataEntity.entity,
                'p_c_method_id': item.methodId,
                'p_ceps': numCepsArray.join(', '),
            });

            const { data } = await api.post("/generar_solicitud_360", parametros);

            if (data?.estado !== 'NO_OK') {

                setResponseData360({ ...responseData360, checkout_url: data.checkout_url, id: data.id, n_id_solicitud: data.n_id_solicitud });
            } else {
                showErrorMsg(data?.msj);

                setBlockDialogData({
                    ...blockDialogData,
                    open: false,
                });
            }

        } catch (exc: any) {
            setBlockDialogData({
                ...blockDialogData,
                open: false,
            });
            showErrorMsg(exc.response?.data?.message.replace("500 - ", ""));
            if (exc.response?.data?.message.includes("500")) {
                setTimeout(async () => {
                    router.reload();
                }, 4000);
            }
        } finally {
            setLoading(false);
        }
    }

    const validarSolicitudPagos360 = async () => {
        setLoading(true);
        try {
            const parametros = qs.stringify({
                'id_soli_pago360': responseData360?.id,
                'id_solicitud': responseData360?.n_id_solicitud,
                'entorno': process.env.urlback
            });
            const { data } = await api.post("/consulta_estado_pago360", parametros);

            if (data?.c_estado_pago) {
                if (data?.c_estado_pago === 'EST_PAID') {
                    setBlockDialogData({
                        ...blockDialogData,
                        c_estado_pago: data?.c_estado_pago,
                        mensajeDialog: data?.d_mensaje,
                        titleDialog: "Solicitud de Débito - Pagos360",
                        open: true,
                        closable: false
                    });
                    setTimeout(async () => {
                        await verifyCeps();
                        await onRenderJsonEntity();
                    }, 7000);

                } else {

                    setBlockDialogData({
                        ...blockDialogData,
                        c_estado_pago: "",
                        detailMensaje: "",
                        mensajeDialog: data?.d_mensaje,
                        titleDialog: "Solicitud de Débito - Pagos360",
                        open: true,
                        closable: true
                    });
                }
            } else {
                showErrorMsg(data?.msj);
            }
        } catch (exc: any) {
            if (exc.response?.data?.error_message) {
                showErrorMsg(exc.response.data.error_message);
                setBlockDialogData({
                    ...blockDialogData,
                    open: false,
                });
            }
        } finally {
            setLoading(false);
        }
    }

    const updateFinalRecords = async () => {
        setLoading(true);
        try {
            const ceps_data = [];
            let uniqueKey: any = sessionStorage.getItem("id_session_my_sql");
            for (const cep of DataEntity.ceps) {
                for (const result of cep.results) {
                    ceps_data.push({
                        paymentId: cep.num_cep,
                        entityGroup: DataEntity.entity,
                        SubEntityGroup: result.subgroup
                    });
                }
            }

            const output_json = {
                id_session: uniqueKey,
                ceps: ceps_data
            };

            const params = qs.stringify({
                'ceps_data': output_json,
            });
            await api.post("/updateFinalRecords", params);
        } catch (exc: any) {
            console.log(exc)
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        if (!windowOpen && Object.keys(responseData360?.checkout_url).length > 0) {
            setBlockDialogData({
                ...blockDialogData,
                c_estado_pago: "initial",
                detailMensaje: "Al finalizar la solicitud por favor cierre la pestaña de la plataforma de 360 y aguarde mientras procesamos su pago.",
                mensajeDialog: "Su solicitud de Pagos360 se encuentra pendiente.",
                titleDialog: 'Solicitud de Débito - Pagos360',
                open: true,
                closable: false
            });

            setWindowOpen(true);
            let idWindow = "myPagos360Win_" + Math.random().toString();
            let ventana = window.open(responseData360?.checkout_url.toString(), idWindow);
            let tiempo = 0;
            var interval = setInterval(function () {
                if (ventana?.closed !== false) {
                    window.clearInterval(interval);
                    setBlockDialogData({
                        c_estado_pago: "",
                        detailMensaje: "",
                        titleDialog: "",
                        mensajeDialog: "",
                        open: false,
                        closable: false
                    });
                    setWindowOpen(false);
                    validarSolicitudPagos360();
                } else {
                    tiempo += 1;
                }
            }, 1000);
        }
    }, [responseData360])

    return (
        <>
            {loading && <Loader />}
            <Dialog draggable={false} headerClassName='custom_dialog_header' header={blockDialogData?.titleDialog} style={{ width: '70vh' }} visible={blockDialogData?.open} breakpoints={{ '768px': '70vw', '425px': '90vw' }} closable={blockDialogData?.closable} footer={null} onHide={() => setBlockDialogData({ ...blockDialogData, open: false })}>
                <p>{blockDialogData?.mensajeDialog}</p>
                {blockDialogData?.c_estado_pago === 'initial' &&
                    <ul style={{ margin: '20px' }}>
                        <li>{blockDialogData?.detailMensaje}</li>
                    </ul>
                }
                {blockDialogData?.c_estado_pago === 'loading' && <ProgressBar style={{ height: '10px' }} className="mt-3" mode="indeterminate"></ProgressBar>}
            </Dialog>
            <div className="flex align-items-center justify-content-around p-3">
                <div className='payment_img' >
                    <img src={item.uriImage}></img>
                </div>
                <div>
                    <i className="pi pi-chevron-right" onClick={recoverUrlSandBox} style={{ fontSize: '25px', cursor: 'pointer' }}></i>
                </div>
            </div>

        </>

    )

}
