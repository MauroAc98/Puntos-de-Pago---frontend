import { Dialog } from 'primereact/dialog';
import { useEffect, useState } from 'react';
import styles from "./consultarCEP.module.css";
import CompositionCupon from './CompositionCupon';
import TableDetail from './TableDetail';
import ReportDetail from './ReportDetail';
import api from "@/services/api";
import qs from "qs";
import { Loader } from '../Loader/Loader';

interface DialogDetailProps {
    showDetail: boolean,
    setShowDetail: any,
    selectedRow: any
}

export default function DialogDetail({
    showDetail,
    setShowDetail,
    selectedRow
}: DialogDetailProps) {

    const [detailsProperties, setDetailsProperties] = useState([]);
    const [compCupon, setCompCupon] = useState({
        header: [],
        body: []
    });
    const [selectedDetail, setSelectedDetail] = useState(null)
    const [isVisibleDetail, setIsVisibleDetail] = useState('initial');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('table');
    const [dataReport, setDataReport] = useState([]);

    const getDetail = async () => {
        try {
            setLoading(true);
            const params = qs.stringify({
                num_cep: selectedRow.cep,
            })
            const { data } = await api.post('/get_detalle', params);
            setCompCupon({ ...compCupon, header: data.header, body: data.body });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }
    const onVolver = () => {
        setIsVisibleDetail('initial');
        if (content !== 'table') {
            setContent('table');
        } else {
            setShowDetail(false);
        }
    }


    useEffect(() => {
        if (selectedRow) {
            getDetail();
        }
    }, [selectedRow])



    return (
        <>
            {loading && <Loader />}
            {(!loading) && <Dialog
                header={content === 'table' && 'Composición de la boleta'}
                draggable={false}
                visible={showDetail}
                onHide={onVolver}
                position={"top"}
                className={styles['custom_dialog']}
                headerClassName={styles['custom_dialog__header']}
                closable={true}
            >
                {(content === 'table') && (
                    <CompositionCupon
                        compCupon={compCupon}
                        setCompCupon={setCompCupon}
                        selectedRow={selectedRow}
                        setDetailsProperties={setDetailsProperties}
                        setContent={setContent}
                        setSelectedDetail={setSelectedDetail}
                        setIsVisibleDetail={setIsVisibleDetail}
                        isVisibleDetail={isVisibleDetail}
                        setDataReport={setDataReport}
                    />
                )}

                {(content === 'report') && (
                    <ReportDetail
                        dataPreview={dataReport}
                    />
                )}

                {(isVisibleDetail === 'details') && (
                    <TableDetail
                        detailsProperties={detailsProperties}
                    />
                )}

            </Dialog>}

        </>
    )
}