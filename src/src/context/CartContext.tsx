import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Dialog } from 'primereact/dialog';
import { useRouter } from "next/router";
import qs from "qs";
import ToastContext from "./ToastContext";
import api from "@/services/api";
import CustomToast from "@/components/CustomToast/CustomToast";

interface ContextResults {
    showAddToCartMsg?: any
    addToCart?: any
    itemCount?: any
    allEntityData?: any
    setAllEntityData?: any
    createCart?: any
    setItemCount?: any,
    set_id_session_db?: any,
    id_session_db?: any,
    eliminarCEP?: any,
    verifyCeps?: any,
    onRenderJsonEntity?: any,
    setTotalCep?: any
}

const CartContext = createContext<ContextResults>({});

interface ContextProps {
    children?: ReactNode
}

const CartContextProvider = ({ children }: ContextProps) => {
    const [toastData, setToastdata] = useState<any>({
        detail: [],
        show: false
    });

    const [showDialog, setShowDialog] = useState(false);
    const [cepNumber, setCepNumber] = useState('');
    const [totalCep, setTotalCep] = useState('');
    const [itemCount, setItemCount] = useState(0);
    // Estado donde se almacenara info para generar los acordeones de pago
    const [allEntityData, setAllEntityData] = useState([]);
    const [id_session_db, set_id_session_db] = useState(0);
    const router = useRouter();
    const { showErrorMsg, showSuccessMsg } = useContext(ToastContext);


    /** TODO hacer que guarde en localstorage el cep y total para que cada vez que se agrgue sumar */
    const addToCart = (cep: string) => {
        let actualCart: any = localStorage.getItem("cart");

        // Verificamos si tenemos un carrito en el localStorage
        if (actualCart) {

            try {
                actualCart = JSON.parse(actualCart);
                addToExistingCart(actualCart, cep);
            } catch (error) {
                // No es array y tendremos que crear nuevo carrito
                createCart(cep);
            }

        } else {
            // Creamos carrito
            createCart(cep);
        }
        // Sumamos todos los totales del carrito
        setItemCount(totalItems());
    }

    const eliminarCEP = (p_CEP: any) => {
        let actualCart: any = localStorage.getItem("cart");
        const ceps = JSON.parse(actualCart) || [];

        const newCart = ceps.filter((item: any) => item.cep !== p_CEP);

        localStorage.setItem('cart', JSON.stringify(newCart));
        setItemCount(totalItems());
    };


    const verifyCeps = async () => {
        const ceps: any = localStorage.getItem("cart");
        let id_session_my_sql: any = sessionStorage.getItem("id_session_my_sql");
        if (ceps && ceps.length > 0) {
            const params = qs.stringify({
                'ceps': ceps,
                'id_session_my_sql': id_session_my_sql
            });

            const { data }: any = await api.post("/framework/verify_ceps", params);
            const invalid = data.ceps?.invalid;
            const paid = data.ceps?.paid;
            const defeated = data.ceps?.defeated;

            const toastData = [];

            if (invalid && invalid.length > 0) {
                toastData.push({
                    severity: 'error',
                    detail: `${invalid.length > 1 ? 'Los BEPs' : 'El BEP'}: ${invalid.join(", ")} ${invalid.length > 1 ? 'no se encuentran válidos para ser pagados' : 'no se encuentra válido para ser pagado'}. Para más información, diríjase a la consulta de BEPs.`,
                });
            }


            if (defeated && defeated.length > 0) {
                toastData.push({
                    severity: 'error',
                    detail: `${defeated.length > 1 ? 'Los BEPs' : 'El BEP'}: ${defeated.join(", ")} ${defeated.length > 1 ? 'se encuentran vencidos' : 'se encuentra vencido'}. Para más información, diríjase a la consulta de BEPs.`,
                });
            }

            if (paid && paid.length > 0) {
                toastData.push({
                    severity: 'success',
                    detail: `${paid.length > 1 ? 'Los BEPs' : 'El BEP'}: ${paid.join(", ")} ${paid.length > 1 ? 'no poseen saldo adeudado' : 'no posee saldo adeudado'}. Para más información, diríjase a la consulta de BEPs.`,
                });
            }

            setToastdata({ detail: toastData, show: true });
            const valid = data.ceps?.valid || [];
            localStorage.setItem('cart', JSON.stringify(valid));
            setItemCount(valid?.length ?? 0);
        }
    };

    const onRenderJsonEntity = async () => {
        let ceps: any = localStorage.getItem("cart");

        while (ceps === null) {
            const newCart: any[] = [];
            localStorage.setItem("cart", JSON.stringify(newCart));
            ceps = localStorage.getItem("cart");
        }

        const cart = JSON.parse(ceps);


        let id_session_my_sql: any = sessionStorage.getItem("id_session_my_sql");

        const params = qs.stringify({
            'id_session_my_sql': id_session_my_sql,
            'ceps': ceps,
        });

        const { data } = await api.post("/renderJsonEntity", params);
        if (!data?.estado) {

            setAllEntityData(data.jsonEntityData.data);
            set_id_session_db(data.jsonEntityData.id_session_oracle);

            if (data.invalidRentax) {

                const cartFiltrado = cart.filter((objeto: any) => !data.invalidRentax.includes(objeto.cep));
                localStorage.setItem('cart', JSON.stringify(cartFiltrado));
                setItemCount(cartFiltrado?.length ?? 0);
                showSuccessMsg(`${data.invalidRentax.length > 1 ? 'Los BEPs' : 'El BEP'}: ${data.invalidRentax.join(", ")} ${data.invalidRentax.length > 1 ? 'no poseen saldo adeudado' : 'no posee saldo adeudado'}. Para más información, diríjase a la consulta de BEPs.`);
            }

        } else {
            showErrorMsg(data.msj);
        }
    }


    const createCart = (cep: string) => {
        let newCart = [{ cep }];
        localStorage.setItem("cart", JSON.stringify(newCart));
    }

    const addToExistingCart = (actualCart: any, cep: string) => {
        actualCart = [...actualCart, { cep }];
        localStorage.setItem("cart", JSON.stringify(actualCart));
    }

    const totalItems = () => {
        let actualCart: any = localStorage.getItem("cart");
        let count = 0;
        // Verificamos si tenemos un carrito en el localStorage
        if (actualCart) {
            actualCart = JSON.parse(actualCart);
            count = actualCart.length;
        }
        return count;
    }

    /** Msj que se muestra al añadir un item al carrito */
    const showAddToCartMsg = (cep: string) => {
        // setTotal(total);
        setCepNumber(cep);
        setShowDialog(true);
    }

    const handleClickPagar = () => {
        router.push('/apps/pagar-cep');
        setShowDialog(false);
    }

    /** Ante cualquier cambio en este context o refresh de pagina, se sumaran los items del localStorage */
    useEffect(() => {
        setItemCount(totalItems());
    }, [])



    const data = {
        showAddToCartMsg,
        addToCart,
        itemCount,
        setAllEntityData,
        allEntityData,
        createCart,
        setItemCount,
        setTotalCep,
        set_id_session_db,
        id_session_db,
        eliminarCEP,
        verifyCeps,
        onRenderJsonEntity
    };

    return (
        <>
            <CustomToast show={toastData.show} detail={toastData.detail} position={'bottom-right'} />
            <CartContext.Provider value={data}>
                <Dialog className="cart" position="top-right" draggable={false} header="" visible={showDialog} modal={false} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
                    <div className="text-center content_cart">
                        <div>BEP N° {cepNumber} Pendiente de Pago</div>
                        <div>Total {totalCep}</div>
                        <div className="mt-3">
                            <Button label="PAGAR" className="button-pdp btn_pagar" onClick={handleClickPagar} />
                        </div>
                    </div>
                </Dialog>

                {children}
            </CartContext.Provider>
        </>
    );
}

export { CartContextProvider };

export default CartContext;