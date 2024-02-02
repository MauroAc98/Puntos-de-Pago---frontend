import styles from "@/components/GenerarCEP/generarCEP.module.css";
import SearchObligaciones from "@/components/GenerarCEP/SearchObligaciones";
import { useContext, useEffect, useState } from "react";
import Obligaciones from "@/components/GenerarCEP/Obligaciones";
import NavBarContext from "@/context/NavBarContext";
import { useRouter } from "next/router";
import { getOblData } from "@/services/helpers";
import { Dialog } from 'primereact/dialog';
import TableDetail from "@/components/GenerarCEP/TableDetail";
import { Button } from 'primereact/button';




export default function GenerarCEP() {
    const { setPageTitle } = useContext(NavBarContext);
    const router = useRouter();
    const [totalObligaciones, setTotalObligaciones] = useState(0);
    // Obligaciones
    const [columnsObligaciones, setColumnsObligaciones] = useState<any>([]);
    const [initialSelectedObligaciones, setInitialSelectObligaciones] = useState([]);
    const [obligaciones, setObligaciones] = useState([]);
    const [selectedObligaciones, setSelectedObligaciones] = useState([]);
    const [renderObligacionesTable, setRenderObligacionesTable] = useState(false);
    const [idSession, setIdSession] = useState(router.query?.id_session);
    const [selectCuit, setSelectCuit] = useState(router.query?.selectcuit);
    const [refreshData, setRefreshData] = useState<any>('');
    const [showTable, setShowTable] = useState(false);
    const [tabState, setTabState] = useState('initial');

    const [showDetail, setShowDetail] = useState(false);
    const [detailsRow, setDetailsRow] = useState([]);

    /** Funcion para generar body customizado de COLUMNA CUIT */
    const customBodyCuit = (rowData: any) => {
        return (
            <div className="flex">
                {rowData.m_bloqueada === 'S' && (
                    <i className="pi pi-times-circle mr-2" style={{ fontSize: '20px' }}></i>
                )}
                <span>{rowData.n_cuit}</span>
            </div>
        );
    }

    /** Funcion que agrega cabeceras a la tabla */
    const addCustomHeader = (header: any) => {
        let newHeader = [...header];
        header.map((item: any) => {
            if (item.field === "n_cuit") {
                item['body'] = customBodyCuit;
            }
        });
        setColumnsObligaciones(newHeader);
    }

    /** Funcion que verifica si obl mensual posee una obl anual y si esa anual no esta bloqueada */
    const verifyCheckedOblMensual = (objetoCheck: string, anioCheck: string, data: any) => {
        const findOblAnual = data.find((obl: any) => {
            const { anio, pos } = getOblData(obl);
            if (obl.objeto === objetoCheck && anio === anioCheck && pos === '00' && obl.m_bloqueada === 'N') {
                return obl;
            }
        });

        // Si encontro una anual, no podra estar chequeada esta mensual
        return findOblAnual ? false : true;
    }

    /** Funcion que setea de acuerdo a condiciones un estado inicial para selected obligaciones */
    const setInitialSelectedData = (data: any) => {
        const newDataSelected = data.filter((item: any) => {
            // Obtengo datos de fila 
            const {
                tributo,
                objeto,
                anio,
                pos
            } = getOblData(item);

            // Valido que sea automotor o inmobiliario
            if (tributo === '10' || tributo === '5') {
                // Si es anual Y no esta bloqueada 
                if (pos === '00' && item.m_bloqueada === 'N') {
                    return item;
                } else if (item.m_bloqueada === 'N' && verifyCheckedOblMensual(objeto, anio, data)) {
                    /** Si es mensual y NO esta bloqueada controlamos, 
                     * si no tiene una anual o la anual esta bloqueada, esta mensual estara chequeada  */
                    return item;
                }
            } else if (item.m_bloqueada === 'N') {
                return item;
            }
        });

        // Seteamos a estado inicial
        setInitialSelectObligaciones(newDataSelected);
    }

    /** Funcion para sumar columna amount */
    const sumAmount = (data: any) => {
        let sumaTotal = 0;
        for (let i = 0; i < data.length; i++) {
            sumaTotal += parseFloat(data[i].amount);

        }
        return sumaTotal;
    }

    /** Funcion para limpiar estados de esta pagina */
    const initialPageState = () => {
        setObligaciones([]);
        setColumnsObligaciones([]);
        setRenderObligacionesTable(false);
        setShowTable(false);
    }

    const openModalDetails = (details: any) => {
        setShowDetail(true);
        setDetailsRow(details);
    }

    const actionButtons = (rowData: any) => {
        return (
            <div className="text-center">
                <Button className="btn_accion" onClick={() => openModalDetails(rowData.details)} icon="pi pi-eye" />
            </div>
        )
    }

    /** Genera columnas + columnas customizadas */
    const generateColumns = (header: any) => {
        const newColumn: any = {
            field: "actionsButtons",
            name: "Detalles",
            align: "center",
            body: actionButtons,
            visibility: true,
        };
        setColumnsObligaciones([...header, newColumn]);
    }


    /** Cada vez que seleccione items en obligaciones hacemos la suma*/
    useEffect(() => {
        if (selectedObligaciones.length > 0) {
            let total = sumAmount(selectedObligaciones);

            setTotalObligaciones(total);
        } else {
            setTotalObligaciones(0);
        }
    }, [selectedObligaciones])


    useEffect(() => {
        if (router.isReady) {
        
            if (router.query?.refresh) {
                setRefreshData(router.query?.refresh)
            }
            if (!router.query.id_session) {

            } else {
                setIdSession(router.query?.id_session);
            }
            setSelectCuit(router.query?.selectcuit)
        }
    }, [router])



    /** Seteamos titulo de pagina en navbar */
    useEffect(() => {
        setPageTitle('Generar BEP')
    }, [])

    return (
        <>

            <SearchObligaciones
                addCustomHeader={addCustomHeader}
                setInitialSelectedData={setInitialSelectedData}
                generateColumns={generateColumns}
                setObligaciones={setObligaciones}
                setSelectedObligaciones={setSelectedObligaciones}
                setRenderObligacionesTable={setRenderObligacionesTable}
                initialPageState={initialPageState}
                idSession={idSession}
                selectedCuit={selectCuit}
                refresh={refreshData}
                setShowTable={setShowTable}
            />

            {showTable && (
                <div className="mt-4">
                    <Obligaciones
                        tabState={tabState}
                        initialSelectedObligaciones={initialSelectedObligaciones}
                        renderTable={renderObligacionesTable}
                        columns={columnsObligaciones}
                        selectedObligaciones={selectedObligaciones}
                        setSelectedObligaciones={setSelectedObligaciones}
                        setObligaciones={setObligaciones}
                        obligaciones={obligaciones}
                        total={totalObligaciones}
                    />
                    <Dialog
                        header="Detalles"
                        draggable={false}
                        visible={showDetail}
                        onHide={() => setShowDetail(false)}
                        position={"center"}
                        className={styles['custom_dialog']}
                        breakpoints={{ '768px': '70vw', '425px': '90vw' }}
                        headerClassName={styles['custom_dialog__header']}
                        closable={false}
                    >
                        <TableDetail
                            data={detailsRow}
                            setShowDetail={setShowDetail}
                        />

                    </Dialog>
                </div>
            )}

        </>
    )
}