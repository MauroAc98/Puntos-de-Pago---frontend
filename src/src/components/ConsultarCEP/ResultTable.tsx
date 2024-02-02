import Table from "@/components/Table/Table";
import { useEffect, useState } from "react";
import { clearSelectedTableRows, formatCUIT } from "@/services/helpers";
import DialogDetail from "./DialogDetail";
import api from "@/services/api";
import { Dialog } from 'primereact/dialog';
import styles from "./consultarCEP.module.css";
import ReportDetail from "./ReportDetail";
import { Loader } from "../Loader/Loader";
import qs from "qs";
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

interface ResultTableInterface {
    dataResult: any,
    setDataResult: any
}

export default function ResultTable({
    dataResult, setDataResult
}: ResultTableInterface) {

    const [selectedRow, setSelectedRow] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('table');
    const [qr, setQr] = useState([]);
    const [blockDialogData, setBlockDialogData] = useState({
        mensajeDialog: "",
        titleDialog: "ATENCIÓN",
        open: false,
        cepRow: ''
    });

    const onRowDoubleClick = (event: any) => {
        // Obtiene el elemento tr correspondiente a la fila que se haya hecho clic 
        const rowElement = event.originalEvent.target.closest("tr");
        // Obtenemos el tbody
        const parentBody = rowElement.parentNode;

        // Deseleccionamos la row que este seleccionada
        clearSelectedTableRows(parentBody);

        // Agrego la clase a la fila 
        rowElement.classList.add("row_selected");

        // Mostramos detail
        setShowDetail(true);

        // Seteamos datos de fila seleccionada
        setSelectedRow(event.data);
    }

    const openDialogQr = async (event: any) => {
        setLoading(true);
        try {
            const param = {
                numberCEP: event.cep,
                dateIssue: event.f_emision.slice(0, 10),
                dateExpiration: event.fecha_caducidad.slice(0, 10),
                idCode: formatCUIT(event.userCode),
                url: event.url,
            }
            const { data }: any = await api.post('/report_consultation_cep', param, { responseType: 'blob' });

            setShowQr(true);
            setContent('qr');
            setQr(data);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const clearBlockDialogData = () => {
        setBlockDialogData({
            ...blockDialogData, open: false, cepRow: '',
            mensajeDialog: ''
        })
    }

    const onDeleteRow = async () => {
        setLoading(true);
        try {
            setBlockDialogData({
                ...blockDialogData,
                open: false
            });
            const param = qs.stringify({
                num_cep: blockDialogData.cepRow,
            });
            const { data }: any = await api.post('/onChangeStatusDeleted', param);

            if (data.state === 'OK') {
                const newCepsArray = dataResult.filter((objeto: any) => objeto.cep !== blockDialogData.cepRow);
                setDataResult(newCepsArray);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const onEventDelete = async (rowData: any) => {
        setBlockDialogData({
            ...blockDialogData,
            open: true,
            mensajeDialog: `¿Está seguro que desea eliminar el CEP N° ${rowData.cep}?`,
            cepRow: rowData.cep
        })
    }


    const actionButtons = (rowData: any) => {
        return (
            <div className="text-center">
                <i className="pi pi-qrcode mr-4 action_btn_table" onClick={() => openDialogQr(rowData)}></i>
                {rowData?.estado === "IMPAGO" && <i className="pi pi-trash action_btn_table_delete" onClick={() => onEventDelete(rowData)} ></i>}
            </div>
        );
    }

    const footerContent = (
        <div>
            <Button label="Cancelar" onClick={clearBlockDialogData} className="p-button-text p-button-danger" />
            <Button label="Continuar" className="button-pdp" onClick={onDeleteRow} />
        </div>
    );

    const columns = [
        {
            field: "url",
            name: "url",
            visibility: false,
        },
        {
            field: "f_emision",
            name: "F. Emisión",
            visibility: false,
        },
        {
            field: "fecha_caducidad",
            name: "fecha_caducidad",
            visibility: false,
        },
        {
            field: "userCode",
            name: "userCode",
            visibility: false,
        },
        {
            field: "cep",
            name: "N° BEP",
            align: "center",
            visibility: true,
        },
        {
            field: "f_pago_formateada",
            name: "F. Emisión",
            align: "center",
            visibility: true,
        },
        {
            field: "total",
            name: "Total",
            align: "right",
            visibility: true,
        },
        {
            field: "estado",
            name: "Estado",
            align: "center",
            visibility: true,
        },
        {
            field: "f_pago",
            name: "F. Pago",
            align: "center",
            visibility: true,
        },
        {
            field: "actionsButtons",
            name: "Acciones",
            align: "center",
            body: actionButtons,
            visibility: true,
        },

    ]

    const rowClassName = (rowData: any) => {

        if (rowData.estado === 'CANCELADO') {
            return 'p-disabled text-red-900 bg-red-200 font-medium';
        }
    }

    const isDataSelectTable = (event: any) => {
        const rowData = event.data;

        return rowData.estado === 'CANCELADO' ? false : true;
    }

    // Cada vez que cerramos dialog, limpiamos datos
    useEffect(() => {
        if (!showDetail) {
            setSelectedRow(null);
        }
    }, [showDetail])


    return (
        <>
            {loading && <Loader />}
            <Dialog draggable={false} headerClassName='custom_dialog_header' header={blockDialogData.titleDialog}
                visible={blockDialogData.open} footer={footerContent} breakpoints={{ '2560px': '30vw', '1024px': '40vw', '768px': '70vw', '425px': '90vw' }} closable={true} onHide={clearBlockDialogData}>
                <p>{blockDialogData.mensajeDialog}</p>
            </Dialog>

            <div className="mt-7">
                <Table
                    data={dataResult}
                    columns={columns}
                    onRowDoubleClick={onRowDoubleClick}
                    isPaginator={true}
                    isDataSelectable={isDataSelectTable}
                    rowClassName={rowClassName}
                />
                {!showDetail && <Tag className="bg-red-200 text-red-900" icon="pi pi-tag" value="Realice doble clic en una fila para visualizar la composición de la deuda."></Tag>}

                {(!loading) &&
                    <>
                        <Dialog
                            draggable={false}
                            visible={showQr}
                            onHide={() => setShowQr(false)}
                            position={"top"}
                            className={styles['custom_dialog']}
                            headerClassName={styles['custom_dialog__header']}
                            closable={true}
                        >
                            <ReportDetail
                                dataPreview={qr}
                            />
                        </Dialog>
                    </>
                }
                <DialogDetail
                    selectedRow={selectedRow}
                    showDetail={showDetail}
                    setShowDetail={setShowDetail}
                />
            </div>
        </>
    )
}