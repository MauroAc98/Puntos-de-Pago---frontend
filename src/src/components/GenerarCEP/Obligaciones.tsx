import { InputText } from "primereact/inputtext";
import { Divider } from 'primereact/divider';
import Table from "@/components/Table/Table";
import { useContext, useEffect, useState } from "react";
import { Button } from 'primereact/button';
import ToastContext from "@/context/ToastContext";
import CartContext from "@/context/CartContext";
import styles from "./generarCEP.module.css";
import { formatCUIT, formatPrice, openPdf } from "@/services/helpers";
import api from "@/services/api";
import qs from "qs";
import { Loader } from '../Loader/Loader';
import useSelectObligaciones from "@/hooks/useSelectObligaciones";
import { Tag } from 'primereact/tag';

interface ObligacionesProps {
    selectedObligaciones: any,
    setSelectedObligaciones: any,
    obligaciones: any,
    setObligaciones: any,
    columns: any,
    renderTable: boolean,
    total: number,
    initialSelectedObligaciones: any,
    tabState: string,
}


export default function Obligaciones({
    selectedObligaciones,
    setSelectedObligaciones,
    obligaciones,
    columns,
    renderTable,
    total, initialSelectedObligaciones, tabState }: ObligacionesProps) {

    const totalTemplate = `$${formatPrice(total.toString())}`;
    const [loading, setLoading] = useState(false);
    const { showErrorMsg } = useContext(ToastContext);
    const { addToCart, showAddToCartMsg,setTotalCep } = useContext(CartContext);
    const [infoBlocked, setInfoBlocked] = useState(false);
    const {
        onRowSelect,
        onRowUnselect,
        onAllRowsSelect,
        onAllRowsUnselect,
    } = useSelectObligaciones(obligaciones, selectedObligaciones, setSelectedObligaciones, initialSelectedObligaciones, tabState);


    const rowClassName = (rowData: any) => {
        if (rowData.m_bloqueada === 'S') {
            return 'p-disabled text-red-900 bg-red-200 font-medium';
        } else if (rowData.m_seleccionable === 'N') {
            return 'p-disabled text-orange-900 bg-orange-100 font-medium';
        }
    }

    const isDataSelectTable = (event: any) => {
        const rowData = event.data;
        return rowData.m_seleccionable === 'N' || rowData.m_bloqueada === 'S' ? false : true;
    }


    const generateCep = async () => {

        setLoading(true);

        try {
            setTotalCep(totalTemplate)
            const { state, message } = jsonGenerationCEPS();
            if (state === 'OK') {
            const params = qs.stringify({
                'CEPs': JSON.stringify(jsonGenerationCEPS())
            });
            const { data }: any = await api.post('/cep_generate', params);
            addToCart(JSON.stringify(data.numCep));
            showAddToCartMsg(`${data.numCep}`);
            const param = {
                numberCEP: data.numCep,
                dateIssue: data.fechaEmision.slice(0, 10),
                dateExpiration: data.fechaCaducidad.slice(0, 10),
                idCode: formatCUIT(data.userCode),
                url: data.url,
            }
            const reportQr: any = await api.post('/report_consultation_cep', param, { responseType: 'blob' });
            openPdf(reportQr.data);
            } else {
                showErrorMsg(message)
            }

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const jsonGenerationCEPS = () => {
        const SaveHeaders = columns.filter((obj: any) => obj.m_guardar_dato !== "N" && obj.m_guardar_dato);

        const paymentDetails: any = [];
        for (let i = 0; i < selectedObligaciones.length; i++) {
            const propiertiesData = SaveHeaders.map((prop: any) => ({
                value: selectedObligaciones[i][prop.field],
                attribute: prop.field,
                title: prop.name,
            }));
            paymentDetails.push({
                debtID: selectedObligaciones[i].debtId,
                debtDescription: selectedObligaciones[i].m_debtDescription,
                entityGroup: selectedObligaciones[i].entityGroup,
                entityGroupDesc: selectedObligaciones[i].entity_description,
                subentityGroup: selectedObligaciones[i].subentity_group,
                subEntityGroupDesc: selectedObligaciones[i].subentity_description
            });

            const details = selectedObligaciones[i].details;
            const subDetails = [];
            for (let j = 0; j < details.length; j++) {
                const detail = details[j];

                subDetails.push({
                    d_atributo: detail.titulo,
                    d_valor: detail.d_valor,
                });
            }

            paymentDetails[i].subDetails = subDetails;

            paymentDetails[i].propiertiesData = propiertiesData;
        }


        let todasBloqueadas = true;


        obligaciones.forEach((object: any) => {
            if (object.m_bloqueada !== 'S') {
                todasBloqueadas = false;
            }
        });


        const CepData = todasBloqueadas ? {
            "state": "NO_OK",
            "message": "No podrá generar el BEP porque todas las obligaciones están bloqueadas por juicio o quiebra.",
        } : selectedObligaciones.length === 0 ? {
            "state": "NO_OK",
            "message": "Debe agregar al menos una Obligación para generar el BEP.",
        } : {
            "state": "OK",
            "codState": "IMP",
            "numState": 701,
            "userCode": selectedObligaciones[0].n_cuit,
            "userName": selectedObligaciones[0].n_denominacion,
            "paymentDetails": paymentDetails
        };

        return CepData;
    }

    useEffect(() => {
        const blocked = obligaciones.find((item: any) => item.m_bloqueada === 'S');
        if (blocked) {
            setInfoBlocked(true);
        } else {
            setInfoBlocked(false);
        }
    }, [obligaciones])

 
    return (
        <>
            {loading && <Loader />}
            {renderTable && (

                <>
                    <Table
                        showCheckBoxRow={true}
                        selection={selectedObligaciones}
                        data={obligaciones}
                        columns={columns}
                        isDataSelectable={isDataSelectTable}
                        rowClassName={rowClassName}
                        onRowSelect={onRowSelect}
                        onRowUnselect={onRowUnselect}
                        onAllRowsSelect={onAllRowsSelect}
                        onAllRowsUnselect={onAllRowsUnselect}
                        isPaginator={true}
                    />
                    <Divider />

                    <div className="grid grid-custom">
                        {infoBlocked && (
                            <div className="col-12 lg:col-4 flex align-items-center justify-content-center order-md-1">
                                <Tag className=" bg-red-200 text-red-900 p-disabled" icon="pi pi-times-circle" value="BLOQUEADO POR JUICIO O QUIEBRA" />
                            </div>
                        )}

                        <div className={`col-12 flex align-items-center ${infoBlocked ? 'lg:col-4 justify-content-center order-md-3' : 'lg:col-12 justify-content-end order-md-2'}`}>
                            <label className="block mr-2">TOTAL</label>
                            <InputText className={['block', styles['input_total']].join(" ")} readOnly value={totalTemplate} />
                        </div>

                        <div className={`col-12 flex align-items-center justify-content-center ${infoBlocked ? 'lg:col-4  order-md-2' : 'order-md-3'}`}>
                            <Button label="GENERAR BEP" onClick={generateCep} className="btn_generar_cep" />
                        </div>

                    </div>

                </>
            )}
        </>
    )

}