import { useEffect, useRef, useState } from "react";
import api from "@/services/api";
import qs from "qs";
import { Loader } from "../Loader/Loader";
import { Dialog } from 'primereact/dialog';
import { log } from "console";

interface EPagos {
    item: any,
    total: any
}

export default function EPagos({
    item, total
}: EPagos) {
    const [loading, setLoading] = useState(false);
    const [datosSoliEPagos, setDatosSoliEPagos] = useState<any>({});
    const [windowOpen, setWindowOpen] = useState(false);
    const [blockDialogData, setBlockDialogData] = useState({
        mensajeDialog: "",
        titleDialog: "Solicitud de Débito - EPAGOS",
        open: false,
        closable: false
    });
    const formEPagosRef = useRef<any>();


    const generarSolicitudDebito = async () => {
        setLoading(true);
        try {

            const params = qs.stringify({
                'totalAmount': total,
            });
            const { data } = await api.post("/generar_solicitud_epagos", params);

            setDatosSoliEPagos(data.postEPagosData);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!windowOpen && Object.keys(datosSoliEPagos).length > 0) {
            setBlockDialogData({
                ...blockDialogData,
                titleDialog: "Solicitud de Débito - EPAGOS",
                mensajeDialog: "Su solicitud de EPAGOS se encuentra pendiente. Finalice la misma para continuar.",
                open: true
            });
            setWindowOpen(true);

            let ventana = window.open("", "myEPagosWin");
            formEPagosRef.current.submit();

            let tiempo = 0;
            var interval = setInterval(function () {
                if (ventana?.closed !== false) {
                    window.clearInterval(interval);
                    setBlockDialogData({
                        ...blockDialogData,
                        titleDialog: "",
                        mensajeDialog: "",
                        open: false
                    });
                    setWindowOpen(false);
                } else {
                    tiempo += 1;
                }
            }, 1000);
        }
    }, [datosSoliEPagos]);


    return (
        <>
            {loading && <Loader />}
            <Dialog draggable={false} headerClassName='custom_dialog_header' header={blockDialogData.titleDialog} visible={blockDialogData.open} style={{ width: '40vw' }} closable={blockDialogData.closable} footer={null} onHide={() => setBlockDialogData({ ...blockDialogData, open: false })}>
                <p>{blockDialogData.mensajeDialog}</p>
            </Dialog>
            <div className="flex align-items-center justify-content-around p-3">
                <div className='payment_img_epago' >
                    <img src={item.uriImage}></img>
                </div>
                <div>
                    <i className="pi pi-chevron-right" onClick={generarSolicitudDebito} style={{ fontSize: '25px', cursor: 'pointer' }}></i>
                </div>
            </div>
            <div style={{ display: "none" }}>
                {Object.keys(datosSoliEPagos).length > 0 &&
                    <form
                        id='formEPagos'
                        name='formEPagos'
                        method='post'
                        target='myEPagosWin'
                        action={datosSoliEPagos["POST_URL"]}
                        ref={formEPagosRef}
                    >
                        {
                            Object.keys(datosSoliEPagos).map((elem: any, idx: any): any => {
                                if (datosSoliEPagos[elem] instanceof Object) {
                                    return (
                                        Object.keys(datosSoliEPagos[elem]).map((subelem: any, idx_dos: any): any => {
                                            return (
                                                <input
                                                    key={subelem + "_" + idx + "_" + idx_dos}
                                                    type="hidden"
                                                    name={subelem}
                                                    value={datosSoliEPagos[elem][subelem]}
                                                />
                                            );
                                        }));
                                } else {
                                    return (
                                        <input
                                            key={elem + "_" + idx}
                                            type="hidden"
                                            name={elem}
                                            value={datosSoliEPagos[elem]}
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