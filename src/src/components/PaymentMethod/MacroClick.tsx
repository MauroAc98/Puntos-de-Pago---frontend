import { useContext, useEffect, useRef, useState } from "react";
import { Loader } from '../../components/Loader/Loader';
import api from "@/services/api";
import { Dialog } from 'primereact/dialog';
import qs from "qs";
import CartContext from "@/context/CartContext";

interface MacroClick {
    DataEntity: any,
    item: any,
    total: any
}

export default function MacroClick({
    item, total, DataEntity
}: MacroClick) {

    const formMacroRef = useRef<any>();
    const [loading, setLoading] = useState(false);
    const [formPostMacroData, setFormPostMacroData] = useState<any>({});
    const [datosMacro, setDatosMacro] = useState({
        url: "",
        id_transaccion: 0,
    });
    const [windowOpen, setWindowOpen] = useState(false);
    const [blockDialogData, setBlockDialogData] = useState({
        mensajeDialog: "",
        titleDialog: "Solicitud de Débito - MacroClick",
        open: false,
        closable: false
    });

    const { id_session_db, onRenderJsonEntity, verifyCeps } = useContext(CartContext);

    const recoverUrlSandBox = async () => {
        await updateFinalRecords();
        setLoading(true);
        try {
            const numCepsArray = [];
            for (const cep of DataEntity.ceps) {
                numCepsArray.push(cep.num_cep);
            }
            const params = qs.stringify({
                'total': total,
                'p_id_sesion': parseInt(id_session_db),
                'p_c_entity_group': DataEntity.entity,
                'p_c_method_id': item.methodId,
                'p_ceps': numCepsArray.join(', '),
            });
            const { data } = await api.post("/generar_solicitud_macro_click", params);
            setDatosMacro({ ...datosMacro, url: data.url_m_click, id_transaccion: data.form_macro_data.TRANSACCIONCOMERCIOID });
            setFormPostMacroData(data.form_macro_data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };



    const validarSolicitudMacro = async () => {
        setLoading(true);
        try {
            const parametros = qs.stringify({
                'id_solicitud': datosMacro.id_transaccion,
                'url_macro': datosMacro.url,
                'entorno': process.env.urlback
            });

            const { data } = await api.post("/consulta_estado_pago_macro", parametros);
            if (data.respuesta === 'OK') {
                if (data.c_respuesta === '3') {
                    setBlockDialogData({
                        ...blockDialogData,
                        mensajeDialog: data.d_mensaje,
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
                        mensajeDialog: data.d_mensaje,
                        open: true,
                        closable: true
                    });
                }
            } else {
                setBlockDialogData({
                    ...blockDialogData,
                    mensajeDialog: data.advert,
                    open: true,
                    closable: true
                });
            }
        } catch (exc: any) {
            console.log(exc)
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
    };

    useEffect(() => {
        if (!windowOpen && Object.keys(formPostMacroData).length > 0) {
            setBlockDialogData({
                ...blockDialogData,
                mensajeDialog: "Su solicitud de MacroClick se encuentra pendiente. Finalice la misma para continuar.",
                open: true,
            });
            setWindowOpen(true);
            let ventana = window.open("", "myMacroPagoWin");
            formMacroRef.current.submit();

            let tiempo = 0;
            var interval = setInterval(function () {
                if (ventana?.closed !== false) {
                    window.clearInterval(interval);
                    setWindowOpen(false);
                    validarSolicitudMacro();
                    setBlockDialogData({
                        ...blockDialogData,
                        mensajeDialog: "",
                        open: false,
                        closable: false
                    });
                } else {
                    tiempo += 1;
                }
            }, 1000);
        }

    }, [formPostMacroData]);

    return (
        <>
            {loading && <Loader />}
            <Dialog draggable={false} headerClassName='custom_dialog_header' header={blockDialogData.titleDialog} visible={blockDialogData.open} style={{ width: '40vw' }} closable={blockDialogData.closable} footer={null} onHide={() => setBlockDialogData({ ...blockDialogData, open: false })}>
                <p>{blockDialogData.mensajeDialog}</p>
            </Dialog>
            <div className="flex align-items-center justify-content-around p-3">
                <div className='payment_img' >
                    <img src={item.uriImage}></img>
                </div>
                <div>
                    <i className="pi pi-chevron-right" onClick={recoverUrlSandBox} style={{ fontSize: '25px', cursor: 'pointer' }}></i>
                </div>
            </div>
            <div style={{ display: "none" }}>
                {Object.keys(formPostMacroData).length > 0 &&
                    <form
                        id='formMacroClick'
                        name='formMacroClick'
                        method='post'
                        target='myMacroPagoWin'
                        action={formPostMacroData["POST_URL"]}
                        ref={formMacroRef}
                    >
                        {
                            Object.keys(formPostMacroData).map((elem: any, idx: any): any => {
                                if (formPostMacroData[elem] instanceof Object) {
                                    return (
                                        Object.keys(formPostMacroData[elem]).map((subelem: any, idx_dos: any): any => {
                                            return (
                                                <input
                                                    key={subelem + "_" + idx + "_" + idx_dos}
                                                    type="hidden"
                                                    name={subelem}
                                                    value={formPostMacroData[elem][subelem]}
                                                />
                                            );
                                        }));
                                } else {
                                    return (
                                        <input
                                            key={elem + "_" + idx}
                                            type="hidden"
                                            name={elem}
                                            value={formPostMacroData[elem]}
                                        />
                                    );
                                }
                            })
                        }
                    </form>
                }
            </div>
        </>

    )

}