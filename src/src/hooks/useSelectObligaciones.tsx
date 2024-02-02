import { getOblData } from "@/services/helpers";
import { useEffect } from "react";

// TODO verificar el estado de no seleccionables, no haria falta con la columna m_bloqueada
export default function useSelectObligaciones(
    obligaciones: any,
    selectedObligaciones: any,
    setSelectedObligaciones: any,
    initialSelectedObligaciones: any,
    tabState: string
) {

    /** Verifica la cantidad de obligaciones mensuales que tenemos chequeadas */
    const checkLastOblMensual = (anioFila: string, objetoFila: string) => {
        let count = 0;
        selectedObligaciones.map((item: any) => {
            // Verifico que sea del mismo año y el mismo objeto/patente
            if (item.posFiscalSinFormatear.slice(0, 4) === anioFila && item.objeto === objetoFila) {
                count++;
            }
        });
        return count == 1 ? true : false;
    }

    /** Funcion que setea si la fila puede ser o no seleccionable */
    const setSeleccionableRows = (seleccionable: string, tipo: string, anioFila: string, objetoFila: string) => {
        const copyObligaciones = [...obligaciones];
        // Si deschequeamos una oblg mensual, controlamos que sea la ultima para volver a colocar seleccionable a la anual
        if (seleccionable === 'S' && tipo === 'ANUAL' && !checkLastOblMensual(anioFila, objetoFila)) {
            return;
        }

        /** COLOCO EL M_SELECIONABLE EN FALSE/TRUE (de acuerdo a lo que le pase)*/
        copyObligaciones.forEach((obl: any) => {
            // Verifico que sea del mismo año y el mismo objeto/patente
            if (obl.posFiscalSinFormatear.slice(0, 4) === anioFila && obl.objeto === objetoFila) {
                let _seleccionable = seleccionable;
                // Si debemos habilitar el seleccionable, verificamos que no sea un item que este bloqueado por base
                if (_seleccionable === 'S') {
                    _seleccionable = obl.m_bloqueada === 'S' ? 'N' : 'S';
                }
                switch (tipo) {
                    case 'MENSUAL':
                        if (obl.posFiscalSinFormatear.slice(-2) !== '00') {
                            obl.m_seleccionable = _seleccionable;
                        }
                        break;
                    case 'ANUAL':
                        if (obl.posFiscalSinFormatear.slice(-2) === '00') {
                            obl.m_seleccionable = _seleccionable;
                        }
                        break;
                }
            }
        });
    }

    /** Funcion que elimina filas de selected obligaciones */
    const deleteSelectedObligaciones = (tipo: string, anioFila: string, objetoFila: string, rowData: any) => {
        const copySelectedObligaciones = [...selectedObligaciones];
        /** QUITAR DE SELECTED OBLIGACIONES LAS MENSUALES O ANUALES, de ACUERDO A LO QUE PASE */
        let newSelectedObligaciones = copySelectedObligaciones.filter((obl: any) => {
            // Verifico que sea del mismo año y el mismo objeto/patente
            if (obl.posFiscalSinFormatear.slice(0, 4) === anioFila && obl.objeto === objetoFila) {
                switch (tipo) {
                    // SI QUIERO ELIMINAR LAS MENSUALES
                    case 'MENSUAL':
                        if (obl.posFiscalSinFormatear.slice(-2) !== '00') {
                            return null;
                        }
                        break;
                    // SI QUIERO ELIMINAR LAS ANUALES
                    case 'ANUAL':
                        if (obl.posFiscalSinFormatear.slice(-2) === '00') {
                            return null;
                        }
                        break;
                }

                // Retorno el item
                return obl;
            }
            // Si no es del mismo año y el mismo objeto/patente, retorno el item ya que solo debo verificar si cumplen esas condiciones
            return obl;
        });
        /** AÑADO LA FILA QUE SELECCIONE */
        newSelectedObligaciones = [...newSelectedObligaciones, rowData];
        setSelectedObligaciones(newSelectedObligaciones);
    }

    const eventLock = (rowData: any) => {
        // Obtengo datos de fila seleccionada
        const { tributo, objeto, anio, pos } = getOblData(rowData);

        // Valido que sea automotor o inmobiliario
        if (tributo === '10' || tributo === '5') {
            /** SI ES ANUAL */
            if (pos === '00') {
                /** COLOCO EL M_SELECIONABLE EN FALSE DE LAS OBLIGACIONES MENSAULES DE ESE OBJETO*/
                setSeleccionableRows('N', 'MENSUAL', anio, objeto);

                /** QUITAR DE SELECTED OBLIGACIONES, LAS MENSUALES DE ESE OBJETO, SOLO DEJO LAS ANUALES */
                deleteSelectedObligaciones('MENSUAL', anio, objeto, rowData);
                return;

            } else {
                /** SI ES MENSUAL */
                /** COLOCO EL M_SELECIONABLE EN FALSE DE LAS OBLIGACIONES ANUALES DE ESE OBJETO*/
                setSeleccionableRows('N', 'ANUAL', anio, objeto);

                /** QUITAR DE SELECTED OBLIGACIONES, LAS ANUALES DE ESE OBJETO, SOLO DEJO LAS MENSUALES */
                deleteSelectedObligaciones('ANUAL', anio, objeto, rowData);

                return;
            }
        }

        /** SINO NO ENTRO EN NINGUNA CONDICION, SELECCIONA LA FILA NORMALMENTE */
        setSelectedObligaciones((prevVal: any) => (
            [...prevVal, rowData]
        ));
    }

    const eventUnlock = (rowData: any) => {
        // Obtengo datos de fila seleccionada
        const { tributo, objeto, anio, pos } = getOblData(rowData);

        // Valido que sea automotor o inmobiliario
        if (tributo === '10' || tributo === '5') {
            /** SI ES ANUAL */
            if (pos === '00') {
                /** COLOCO EL M_SELECIONABLE EN FALSE DE LAS OBLIGACIONES MENSAULES DE ESE OBJETO*/
                setSeleccionableRows('S', 'MENSUAL', anio, objeto);

                return;

            } else {
                /** SI ES MENSUAL */
                /** COLOCO EL M_SELECIONABLE EN FALSE DE LAS OBLIGACIONES ANUALES DE ESE OBJETO*/
                setSeleccionableRows('S', 'ANUAL', anio, objeto);
                return;
            }
        }
    }


    const validatorClass = (dato: any) => {
        const data = dato.originalEvent.target.className;
        const regex = /\bbtn_accion\b/;
        return regex.test(data);
    }

    // Al seleccionar fila
    const onRowSelect = (rowData: any) => {
        if (!validatorClass(rowData)) {
            const { data } = rowData;
            eventLock(data);
        }
    }

    // Al deseleccionar fila
    const onRowUnselect = (rowData: any) => {
        if (!validatorClass(rowData)) {
            const { data } = rowData;
            eventUnlock(data);
            setSelectedObligaciones((prevVal: any) => {
                const updatedItems = prevVal.filter((item: any) => item.debtId !== data.debtId);
                return updatedItems;
            });
        }
    }

    // Coloca en estado inicial las obligaciones chequeadas y si son seleccionables
    const setInitialStateObligaciones = () => {
        setSelectedObligaciones(initialSelectedObligaciones);
        setInitialSeleccionableRows();
    }

    // Funcion que coloca el m_seleccionable en S o N, dependiendo si esta en el estado inicial de seleccionadas
    const setInitialSeleccionableRows = () => {
        const copyObligaciones = [...obligaciones];
        copyObligaciones.map((obl: any) => {
            // Obtengo datos de fila seleccionada
            const { tributo } = getOblData(obl);

            // Valido que sea automotor o inmobiliario
            if (tributo === '10' || tributo === '5') {
                // Buscamos la obligacion en el array inicial de seleccionadas
                const findObl = initialSelectedObligaciones.find((item: any) => item.debtId === obl.debtId);

                // Si encuentra, colocar seleccionable
                obl.m_seleccionable = findObl ? 'S' : 'N';
            }
        });
    }

    // Al seleccionar TODAS las filas
    const onAllRowsSelect = () => {
        setInitialStateObligaciones();
    }

    // Al deseleccionar TODAS las filas
    const onAllRowsUnselect = () => {
        setSelectedObligaciones([]);
        const copyObligaciones = [...obligaciones];
        copyObligaciones.map((obl: any) => {
            obl.m_seleccionable = obl.m_bloqueada === 'N' ? 'S' : 'N';
        });
    }

    /** Obligaciones que estaran seleccionadas inicialmente 
     * se ejecuta solo si el tab se abre por primera vez
    */
    useEffect(() => {
        if (tabState === 'initial') {
            setInitialStateObligaciones();
        }
    }, [])

    return {
        onRowSelect,
        onRowUnselect,
        onAllRowsSelect,
        onAllRowsUnselect
    };
}