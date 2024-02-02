import ToastContext from '@/context/ToastContext';
import useCustomForm from '@/hooks/useCustomForm';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from "primereact/dropdown";
import { Fieldset } from 'primereact/fieldset';
import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import styles from "./consultarCEP.module.css";
import api from "@/services/api";
import { Loader } from '../Loader/Loader';
import NavBarContext from '@/context/NavBarContext';
import qs from "qs";
import DataUserContext from '@/context/DataUserContext';
import useGetCepStatus from '@/hooks/useGetCepStatus';



const initialFormValues = {
    n_cep: '',
    f_emision_desde: '',
    f_emision_hasta: '',
    estado: '',
    d_denominacion: '',
    n_cuit: '',
}

interface SearchCEPInterface {
    setColumnsResult: any,
    setDataResult: any,
    setShowResultTable: any,
    initialPageState: any
}

export default function SearchCEP(props: SearchCEPInterface) {
    const { getStatus } = useGetCepStatus(onSuccessGetStatus);

    function onSuccessGetStatus(data: any) {
        setOptionState(data);
    }

    const { handleFormChange, formData, setFormData } = useCustomForm(initialFormValues);
    const { showWarningMsg, showErrorMsg } = useContext(ToastContext);
    const [optionState, setOptionState] = useState([]);
    const [loading, setLoading] = useState(false);
    const { userLogged } = useContext(NavBarContext);
    const { dataUser, setDataUser, refreshData, setRefreshData } = useContext(DataUserContext);
    const [cuitDelegante, setCuitDelegante] = useState({
        d_denominacion: '', n_cuit: '',
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 425)

    const onSubmitForm = async (event: any) => {
        event.preventDefault();

        // Verificamos si ingreso valores para poder buscar
        if (formData == initialFormValues) {
            showWarningMsg('Por favor, ingresar al menos un campo para realizar la búsqueda');
            return;
        }

        try {

            setLoading(true);
            const params = qs.stringify({
                'n_cuit': formData.n_cuit,
                'n_cep': formData.n_cep,
                'estado': formData.estado,
                'f_emision_desde': formData.f_emision_desde,
                'f_emision_hasta': formData.f_emision_hasta
            });

            const { data } = await api.post("/get_consulta", params);
            props.setDataResult(data);
            if (data.length <= 0) {
                showErrorMsg('No se encontró ningún registro.')
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }

    }

    const handleCuitChange = (event: any) => {
        if (userLogged.entorno === 'EXT') {
            const select_cuit: any = dataUser.find((data: any) => data.n_cuit === event.value);

            setFormData({
                ...formData,
                n_cuit: event.value,
                d_denominacion: select_cuit.d_denominacion
            });
        }
    };

    const handleDenominacionChange = (event: any) => {
        if (userLogged.entorno === 'EXT') {
            const valueDeno = event.target.value;
            const valueDenominacion: any = dataUser.find((item: any) => item.d_denominacion === valueDeno);
            setFormData({
                ...formData,
                n_cuit: valueDenominacion.n_cuit,
                d_denominacion: valueDeno
            });
        }
    };


    const onCleanForm = () => {
        setFormData({
            ...formData, n_cep: '',
            f_emision_desde: '',
            f_emision_hasta: '',
            estado: '',
            d_denominacion: cuitDelegante.d_denominacion,
            n_cuit: cuitDelegante.n_cuit,
        });
        props.initialPageState();
    }

    const retrieveUser = async () => {

        if (refreshData.data !== null) {

            const datosModificados = refreshData.data.map((objeto: any) => {
                if ("identificador" in objeto) {
                    objeto.n_cuit = objeto.identificador;
                    delete objeto.identificador;
                }

                if ("denominacion" in objeto) {
                    objeto.d_denominacion = objeto.denominacion;
                    delete objeto.denominacion;
                }

                return objeto;
            });

            setDataUser(datosModificados);
            return;
        }

        if (!dataUser || (dataUser && dataUser.length === 0)) {
            try {
                setLoading(true);
                const params = qs.stringify({
                    p_m_acepta_esperar: 'S'
                })
                const { data }: any = await api.post('/getDataUser', params);
                if (data.state != 'NO_OK') {
                    setDataUser(data.data);
                   
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

    }


    const searchCuit = async () => {
        if (formData.n_cuit) {
            try {
                setLoading(true);
                const params = qs.stringify({
                    userSelect: formData.n_cuit,
                    entorno: 'INT',
                    p_m_acepta_esperar: 'N'
                })
                const { data }: any = await api.post("/getDataUser", params);
                if (data.state === 'OK') {
                    setFormData({
                        ...formData,
                        d_denominacion: data.data[0].d_denominacion,
                        n_cuit: data.data[0].n_cuit
                    });
                } else {
                    setFormData(initialFormValues);
                    showErrorMsg('No se encontró ningún dato asociado al CUIT ingresado');
                }

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    }

    const customValueTemplate = (option: any) => {

        if (option) {

            const maxLength = isMobile ? 18 : 50;

            const selectedValue = option.d_denominacion || option.label;

            const displayLabel = selectedValue.length > maxLength
                ? selectedValue.substring(0, maxLength) + '...'
                : selectedValue;

            return (
                <div>
                    {displayLabel}
                </div>
            );
        } else {
            return (
                <div>
                    {'Seleccionar'}
                </div>
            );
        }
    };

    useEffect(() => {
       
        if (userLogged?.entorno === 'EXT' && dataUser) {

            const user_select: any = dataUser.find((data: any) => data.default === 'S');

            if (user_select) {
                setFormData({
                    ...formData,
                    d_denominacion: user_select.d_denominacion,
                    n_cuit: user_select.n_cuit
                });
                setCuitDelegante({ ...cuitDelegante, n_cuit: user_select.n_cuit, d_denominacion: user_select.d_denominacion });
            }
             setRefreshData({ ...refreshData, data: null })
        }
    }, [dataUser, userLogged])

    useEffect(() => {
        retrieveUser();
    }, [])


    useEffect(() => {
        getStatus();
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 425);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            {loading && <Loader />}
            <Fieldset legend="Búsqueda">
                <form className='grid' onSubmit={onSubmitForm}>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">CUIT</label>
                        {userLogged?.entorno === 'EXT' ?
                            <Dropdown
                                className="w-full"
                                options={dataUser}
                                optionLabel={'n_cuit'}
                                optionValue={'n_cuit'}
                                value={formData?.n_cuit ?? ''}
                                onChange={handleCuitChange}
                                placeholder="Seleccionar"
                            />
                            : <InputText type="text" name="n_cuit" value={formData?.n_cuit ?? ''} maxLength={11} onBlur={searchCuit} onChange={({ target }) => setFormData({ ...formData, n_cuit: target.value })} className="block" keyfilter={/\d/} />}
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">Denominación</label>
                        {userLogged?.entorno === 'EXT' ?
                            <Dropdown
                                className="w-full"
                                options={dataUser}
                                optionLabel={'d_denominacion'}
                                optionValue={'d_denominacion'}
                                value={formData?.d_denominacion}
                                onChange={handleDenominacionChange}
                                valueTemplate={customValueTemplate}
                                placeholder="Seleccionar"
                            />
                            :
                            <InputText type="text" name="denominacion" value={formData?.d_denominacion ?? ''} onChange={handleFormChange} className="block" readOnly />}
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">N° BEP</label>
                        <InputText type="text" name="n_cep" value={formData.n_cep} keyfilter={/\d/} onChange={handleFormChange} className="block p-inputtext-md w-full" />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">Estado</label>
                        <Dropdown
                            className="text-sm w-full"
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            options={optionState}
                            optionLabel={'label'}
                            optionValue={'value'}
                            onChange={handleFormChange}
                            placeholder="Seleccionar"
                        >
                        </Dropdown>
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">F. Emisión Desde</label>
                        <Calendar dateFormat="dd/mm/yy" name="f_emision_desde" value={formData.f_emision_desde} onChange={handleFormChange} showIcon className={[styles['calendar'], 'w-full'].join(" ")} />
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <label className="text-sm text-600 block mb-2">F. Emisión Hasta</label>
                        <Calendar dateFormat="dd/mm/yy" name="f_emision_hasta" value={formData.f_emision_hasta} onChange={handleFormChange} showIcon className={[styles['calendar'], 'w-full'].join(" ")} />
                    </div>

                    <div className="col-12 text-center mt-2">
                        <Button onClick={onCleanForm} type='button' className="mr-2 btn_white">LIMPIAR</Button>
                        <Button type='submit' loading={loading} className="btn_violet">BUSCAR</Button>
                    </div>
                </form>
            </Fieldset>
        </>
    )
}