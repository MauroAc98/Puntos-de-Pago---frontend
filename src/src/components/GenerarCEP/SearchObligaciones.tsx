import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SelectItem } from "primereact/selectitem";
import { Dropdown } from "primereact/dropdown";
import { Fieldset } from "primereact/fieldset";
import { Checkbox } from 'primereact/checkbox';
import useCustomForm from "@/hooks/useCustomForm";
import { useContext, useEffect, useState } from "react";
import ToastContext from "@/context/ToastContext";
import qs from "qs";
import api from "@/services/api";
import { Loader } from '../Loader/Loader';
import { formattedPosFiscal, unformatterPosFiscal } from "@/services/helpers";
import CustomDialogEspera from "../CustomDialog/CustomDialogEspera";
import DataUserContext from "@/context/DataUserContext";




// TODO : VERIFICAR CAMPOS COMO F PAGO, DENOMINACION QUE NO ESTAN EN EL FORMULARIO
const initialFormValues = {
  cuit: "",
  denominacion: "",
  tributo: "",
  subtributo: "",
  objeto: "",
  recarga: "N",
  posFiscalD: "",
  posFiscalH: "",
  oblPagables: false,
};
interface ResponseFilter {
  n_cuit: string;
  d_denominacion: string;
  default: string;
  filters: {
    d_concepto: string;
    c_concepto: string;
    d_tributos: {
      c_tributo: string;
      d_tributo: string;
      d_objeto: string[];
    }[];
  }[];
}
interface SearchObligacionesProps {
  setObligaciones: any;
  setSelectedObligaciones: any;
  setRenderObligacionesTable: any;
  initialPageState: any;
  idSession?: any;
  selectedCuit?: any;
  setShowTable: any;
  generateColumns: any;
  setInitialSelectedData: any;
  addCustomHeader: any;
  refresh?: any
}

export default function SearchObligaciones(props: SearchObligacionesProps) {

  const [responseData, setResponseData] = useState<ResponseFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleFormChange, formData, setFormData } = useCustomForm(initialFormValues);
  const { showErrorMsg } = useContext(ToastContext);
  const [optionsTributo, setOptionsTributo] = useState<SelectItem[]>([]); //state para  los tributos
  const [subTributosOptions, setSubTributosOptions] = useState<SelectItem[]>([]); //state para  los subtributo
  const [ObjetoOptions, setObjetoOptions] = useState<SelectItem[]>([]); //state para  los objetos
  const [isChecked, setIsChecked] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 425)
  const { setRefreshData, setDataUser } = useContext(DataUserContext);
  const [dialogData, setDialogData] = useState({
    open: false,
    title: "ATENCIÓN",
    message: "",
    p_m_demora: "",
  });

  useEffect(() => {
    const initialFormValues = {
      cuit: formData.cuit ? formData.cuit : props.selectedCuit,
      denominacion: formData.denominacion,
      tributo: optionsTributo,
      subtributo: "",
      objeto: "",
      recarga: "N",
      posFiscalD: "",
      posFiscalH: "",
      oblPagables: false,
    };
    const user_select: any = responseData.find(data => data.default === 'S');

    if (user_select) {
      setFormData({
        ...formData,
        cuit: user_select.identificador,
        denominacion: user_select.denominacion,
      });
      if (props.refresh) {
        setRefreshData({ cuit: user_select.identificador, deno: user_select.denominacion, data: responseData })
      }

      setOptionsTributo(user_select.filters);
    } else {

      setFormData(initialFormValues)
    }
  }, [responseData])

  const setter = () => {
    setFormData({
      ...formData, tributo: "",
      subtributo: "",
      objeto: "",
      posFiscalD: "",
      posFiscalH: "",
      oblPagables: false,
    })

    setSubTributosOptions([]);
    setObjetoOptions([]);
    setIsChecked(false);
  }


  const recuperarEstadoInicial = async () => {
    try {
      setLoading(true)
      const params = qs.stringify({
        userSelect: props.selectedCuit
      });
      const { data } = await api.post("/get_filter", params);
      if (data?.estado !== 'NO_OK') {
        setResponseData(data.data);
        setDataUser(null)
        renderTblObligaciones();
      } else {
        showErrorMsg("Ocurrió un problema. Intente más tarde.");
      }
    } catch (error) {
      showErrorMsg("Ocurrió un problema. Intente más tarde.");
    }
  };

  const handleCuitChange = (event: any) => {
    const valueCuit = event.target.value;
    const valueDenominacion: any = responseData.find((item: any) => item.identificador == valueCuit);
    setFormData({
      ...formData,
      cuit: event.target.value,
      denominacion: valueDenominacion.denominacion
    });

    if (props.refresh) {
      setRefreshData({ cuit: event.target.value, deno: valueDenominacion.denominacion, data: responseData })
    }

    setOptionsTributo(valueDenominacion.filters);

  };

  const handleDenominacionChange = (event: any) => {
    const valueDeno = event.target.value;
    const valueDenominacion: any = responseData.find((item: any) => item.denominacion == valueDeno);

    setFormData({
      ...formData,
      cuit: valueDenominacion.identificador,
      denominacion: valueDeno
    });
    setOptionsTributo(valueDenominacion.filters);

  };


  const handleTributoChange = (event: any) => {

    const valuetributo = event.target.value;
    setFormData({
      ...formData,
      tributo: valuetributo
    });
    setSubTributosOptions(valuetributo.d_tributos)
    setObjetoOptions([]);
  };

  const handleSubTributoChange = (event: any) => {
    const valueSubtributo = event.target.value;
    setFormData({
      ...formData,
      subtributo: valueSubtributo
    });
    let options: any = []

    valueSubtributo.d_objeto.map((item: any) => {
      options = [...options, {
        name: item
      }]
    })
    setObjetoOptions(options)
  };

  const onSubmitForm = async (event: any) => {
    formData.recarga = "S";

    event.preventDefault();
    try {
      renderTblObligaciones();
    } catch (error) {
      showErrorMsg("Ocurrió un problema. Intente más tarde.");
    }
  };

  async function renderTblObligaciones() {
    props.initialPageState();
    setLoading(true)
    try {

      let id_Session = null;
      if (formData.recarga === 'N') {
        id_Session = props.idSession;
      }


      if (!props.idSession && formData.recarga === "N") return;

      const params = {
        cuit: formData.cuit,
        idSession: id_Session,
        tributo: formData.tributo.c_concepto,
        subtributo: formData.subtributo.c_tributo,
        objeto: formData.objeto,
        recarga: formData.recarga,
        posDesde: unformatterPosFiscal(formData.posFiscalD),
        posHasta: unformatterPosFiscal(formData.posFiscalH),
        soloDeuda: "S",
        obliPagables: isChecked ? 'S' : 'N',
        p_m_acepta_esperar: dialogData?.p_m_demora === 'S' ? 'S' : 'N'
      }


      const { data }: any = await api.post("/generar_cep", params);


      if (data.state === 'OK') {

        if (data?.p_m_demora === 'S') {
          setDialogData({ ...dialogData, open: true, message: data.message, p_m_demora: data.p_m_demora })
        } else {
          const body = data.data.body;
          const header = data.data.header;

          if (body.length !== 0) {
            props.setInitialSelectedData(data.data.body);
            props.addCustomHeader(data.data.header);
            props.setShowTable(true);
            props.setObligaciones(body);
            props.generateColumns(header);
            props.setRenderObligacionesTable(true);
            props.setSelectedObligaciones([]);
          } else {
            formData.recarga !== 'N' ? showErrorMsg('No se encontró ningún registro de deudas') : undefined;
          }
        }

      } else {
        console.log(data.message);
      }

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  }

  const handleBlur = () => {
    setFormData({
      ...formData,
      posFiscalD: formattedPosFiscal(formData.posFiscalD),
      posFiscalH: formattedPosFiscal(formData.posFiscalH),
    });
  };

  const onFocus = (e: any) => {
    const value = e.target.value;
    const typePosFiscal = e.currentTarget.id;
    if (value) {
      if (typePosFiscal === 'pos_fiscal_hasta') {
        setFormData({
          ...formData,
          posFiscalH: unformatterPosFiscal(value),
        });
      } else {
        setFormData({
          ...formData,
          posFiscalD: unformatterPosFiscal(value),
        });
      }
    }
  }

  const handleCheck = (event: any) => {
    setIsChecked(event.target.checked);
    setFormData({ ...formData, oblPagables: event.target.checked });
  };

  const customValueTemplate = (option: any) => {

    if (option) {

      const maxLength = isMobile ? 18 : 50;

      const selectedValue = option.denominacion || option.d_concepto || option.d_tributo || option.name;

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

  const onStay = () => {
    formData.recarga = "S";
    renderTblObligaciones();
    setDialogData({ ...dialogData, open: false, p_m_demora: 'N' })
  }

  const footerContent = (
    <div>
      <Button label="Aceptar" onClick={onStay} className="button-pdp" />
      <Button label="Cancelar" className="p-button-text p-button-danger" onClick={() => setDialogData({ ...dialogData, open: false, p_m_demora: 'N' })} />
    </div>
  );


  useEffect(() => {
    setter();
  }, [formData.cuit])

  useEffect(() => {
    setFormData({
      ...formData,
      subtributo: "",
      objeto: "",
    })
  }, [formData.tributo])


  useEffect(() => {
    recuperarEstadoInicial();
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
      <CustomDialogEspera title={dialogData.title} message={dialogData.message} open={dialogData.open} footer={footerContent} setDialogData={setDialogData} dialogData={dialogData} />
      {loading && <Loader />}

      <Fieldset legend="Búsqueda">

        <form className="grid" onSubmit={onSubmitForm}>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">CUIT</label>
            <Dropdown
              className="text-sm text-600 flex align-items-center"
              id="cuit"
              name="cuit"
              options={responseData}
              optionLabel={'identificador'}
              optionValue={'identificador'}
              value={formData.cuit}
              onChange={handleCuitChange}
              placeholder="Seleccionar"
            />

          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">Denominación</label>
            <Dropdown
              className="text-sm text-600 flex align-items-center"
              id="deno"
              name="deno"
              options={responseData}
              optionLabel={'denominacion'}
              optionValue={'denominacion'}
              value={formData.denominacion}
              onChange={handleDenominacionChange}
              valueTemplate={customValueTemplate}
              placeholder="Seleccionar"
            />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">Tributo</label>

            <Dropdown
              className="text-sm text-600 flex align-items-center"
              id="tributo"
              name="tributo"
              options={optionsTributo}
              optionLabel={'d_concepto'}
              value={formData.tributo}
              onChange={handleTributoChange}
              valueTemplate={customValueTemplate}
              placeholder="Seleccionar"
            />

          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">Subtributo</label>
            <Dropdown
              className="text-sm text-600 flex align-items-center"
              id="subtributo"
              name="subtributo"
              value={formData.subtributo}
              options={subTributosOptions}
              optionLabel={'d_tributo'}
              onChange={handleSubTributoChange}
              placeholder="Seleccionar"
              valueTemplate={customValueTemplate}
            />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">Objeto</label>

            <Dropdown
              className="text-sm text-600 flex align-items-center"
              id="objeto"
              name="objeto"
              value={formData.objeto}
              options={ObjetoOptions}
              optionLabel={'name'}
              optionValue={'name'}
              onChange={handleFormChange}
              valueTemplate={customValueTemplate}
              placeholder="Seleccionar"
            />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">
              Pos. Fiscal Desde
            </label>
            <InputText id="pos_fiscal_desde" type="text" className="block" onChange={(event) => {
              setFormData({
                ...formData,
                posFiscalD: event.target.value
              });
            }} value={formData.posFiscalD} onBlur={handleBlur} keyfilter={/\d/} maxLength={6} onFocus={(e) => onFocus(e)} />
          </div>
          <div className="col-12 md:col-6 lg:col-3">
            <label className="text-sm text-600 block mb-2">
              Pos. Fiscal Hasta
            </label>
            <InputText id="pos_fiscal_hasta" type="text" className="block" onChange={(event) => {
              setFormData({
                ...formData,
                posFiscalH: event.target.value
              });
            }} value={formData.posFiscalH} onBlur={handleBlur} keyfilter={/\d/} maxLength={6} onFocus={(e) => onFocus(e)} />
          </div>
          <div className="col-12 md:col-6 lg:col-3 flex align-items-end">
            <label className="text-sm text-600 block mb-2">
              <Checkbox value="obligaciones" onChange={handleCheck
              } checked={isChecked} className="mx-2" />
              Obligaciones pagables
            </label>
          </div>
          <div className="col-12 text-center mt-2">
            <Button
              onClick={setter}
              type="button"
              label="LIMPIAR"
              className="mr-2 btn_white"
            />
            <Button
              loading={loading}
              type="submit"
              label="BUSCAR"
              className="btn_violet"
            />
          </div>
        </form>
      </Fieldset>
    </>
  );
}
