import Table from '@/components/Table/Table';
import { clearSelectedTableRows } from '@/services/helpers';
import api from "@/services/api";
import { useEffect, useState } from 'react';
import { Loader } from '../Loader/Loader';
import qs from "qs";
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
interface TableDetailProps {
    setDetailsProperties: any,
    setContent: any,
    setSelectedDetail: any,
    setIsVisibleDetail: any,
    setDataReport?: any,
    selectedRow?: any,
    isVisibleDetail?: any,
    setCompCupon?: any,
    compCupon?: any
}

export default function CompositionCupon({
    setDetailsProperties,
    setContent,
    setSelectedDetail, setIsVisibleDetail, setDataReport, selectedRow, isVisibleDetail, setCompCupon, compCupon
}: TableDetailProps) {

    const [loading, setLoading] = useState(false);
    const handleClickReport = async (rowData: any, event: any) => {
        const params = qs.stringify({
            'ticketID': rowData.ticketID
        });

        const typePreview = event.currentTarget.id;

        const url = typePreview === 'boleta' ? '/get_boleta' : '/get_comprobante';

        try {
            setLoading(true);
            const { data }: any = await api.post(url, params, { responseType: 'blob' });

            setDataReport(data);
            setContent('report');
            setIsVisibleDetail('initial');
            setSelectedDetail(rowData);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let newHeader = [...compCupon.header];
        newHeader.map((item: any) => {
            if (item.field === "boleta") {
                item['body'] = previewbBol;
            }
            if (item.field === "comprobante") {
                item['body'] = previewCompr;
            }
        });
        setCompCupon({ ...compCupon, header: newHeader });
    }, [])



    const previewbBol = (rowData: any) => {
        return (
            <div className="text-center">
                <Button id='boleta' icon="pi pi-file-pdf action_btn_table" className="p-button-rounded p-button-help p-button-text "
                    onClick={(event) => handleClickReport(rowData, event)} disabled={selectedRow?.estado === "IMPAGO" || rowData.ticketID === null} />
            </div>
        );
    }

    const previewCompr = (rowData: any) => {
        return (
            <div className="text-center">
                <Button id='comprobante' icon="pi pi-file-pdf action_btn_table" className="p-button-rounded p-button-help p-button-text " onClick={(event) => handleClickReport(rowData, event)} disabled={selectedRow?.estado === "IMPAGO" || rowData.ticketID === null} />
            </div>
        );
    }

    const onRowDoubleClick = (event: any) => {
        setIsVisibleDetail('details');
        setDetailsProperties(event.data.subDetailsAmount);
        // Obtiene el elemento tr correspondiente a la fila que se haya hecho clic 
        const rowElement = event.originalEvent.target.closest("tr");
        // Obtenemos el tbody
        const parentBody = rowElement.parentNode;

        // Deseleccionamos la row que este seleccionada
        clearSelectedTableRows(parentBody);

        // Agrego la clase a la fila 
        rowElement.classList.add("row_selected");

    }

    return (
        <>
            {loading && <Loader />}

            <Table
                data={compCupon.body}
                columns={compCupon.header}
                onRowDoubleClick={onRowDoubleClick}
                isPaginator={true}

            />
            {isVisibleDetail != 'details' && <Tag className="bg-red-200 text-red-900" icon="pi pi-tag" value="Realice doble clic en una fila para visualizar los detalles."></Tag>}
        </>
    )
}