import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button";
import { useEffect, useState, useContext } from "react";
import { QrScanner } from "@/components/QrScanner/QrScanner";
import NavBarContext from "@/context/NavBarContext";
import EntityAccordions from "@/components/Pago/EntityAccordions";
// json de ejemplo
import CartContext from "@/context/CartContext";
import useCustomForm from "@/hooks/useCustomForm";
import ToastContext from "@/context/ToastContext";
import { Loader } from '../../components/Loader/Loader';
import { useRouter } from 'next/router';
import { generationUniqueKey } from "@/services/helpers";

const initialValues = {
  nroCep: ''
}

export default function PagarCep() {
  const { showWarningMsg, showErrorMsg } = useContext(ToastContext);
  const { setPageTitle } = useContext(NavBarContext);
  const { verifyCeps, onRenderJsonEntity, addToCart } = useContext(CartContext);
  const { formData, setFormData, handleFormChange } = useCustomForm(initialValues);
  const [indexAdded, setIndexAdded] = useState(null);
  const [qrScanner, setQrScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleScan = (data: any) => {
    try {
      if (data) {
        const url = new URL(data);
        const dataValue = url.searchParams.get("data");
        addOneCep(dataValue);
        setQrScanner(false);
      }
    } catch (error) {
      showErrorMsg('Ocurrió un problema. Intente de nuevo.')
    }
  }


  const onSubmitForm = (e: any) => {
    e.preventDefault();
    try {
      const nroCep = formData.nroCep;
      if (nroCep.length > 0) {
        setFormData({ ...formData, nroCep: "" });
        addOneCep(nroCep);
      } else {
        showWarningMsg('Por favor, ingresar un número de BEP para continuar');
      }

    } catch (error) {
      showErrorMsg('Ocurrió un problema. Intente de nuevo.')
    }
  }

  const addOneCep = async (cep: any) => {
    setLoading(true);
    try {
      addToCart(cep);
      await verifyCeps();
      await onRenderJsonEntity();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };


  const init = async () => {
    generationUniqueKey();
    setLoading(true);
    try {
      await verifyCeps();
      await onRenderJsonEntity();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    const cep = router.query.data
    if (cep) {
      addToCart(cep);
    }
  }, [router])


  useEffect(() => {
    setPageTitle('Pagar BEP')
    init();
  }, []);


  return (
    <>
      {loading && <Loader />}
      <div>

        <div className='col-12'>
          <div className="border-1 border-400 shadow-2 p-2 border-round-xl">
            <form onSubmit={onSubmitForm} className={'col-12 lg:flex align-items-center justify-content-between'}>
              <div className="col-12 lg:col-4">
                <label className="text-sm text-600">Ingrese su número de BEP</label>
                <span className='p-input-icon-right w-full mt-2'>
                  <i className="pi pi-qrcode cursor-pointer" onClick={() => setQrScanner(true)} ></i>
                  <InputText value={formData?.nroCep ?? ''} onChange={handleFormChange} keyfilter={/\d/} placeholder='N° BEP' name='nroCep' className='p-inputtext-md' />
                  {qrScanner && (
                    <div className="overlay" onClick={() => qrScanner ? setQrScanner(false) : qrScanner}>
                      <QrScanner handleScan={handleScan} />
                    </div>
                  )}
                </span>
              </div>
              <div className="col-12 lg:col-4">
                <label className="text-white">.</label>
                <Button className='p-button-md button-pdp w-full mt-2' label="Agregar" />
              </div>
            </form>
          </div>
        </div>

        <EntityAccordions
          indexAdded={indexAdded}
        />

      </div>
    </>

  )
}