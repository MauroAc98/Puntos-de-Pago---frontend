import CartContext from "@/context/CartContext";
import { useContext, useEffect, useState } from "react";
import styles from "./accordionCep.module.css";
import { Loader } from '../../components/Loader/Loader';
import { formatPrice } from "@/services/helpers";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface AccordionCep {
    nroCep: number,
    cepData: any,
}

export default function AccordionCep({
    nroCep,
    cepData,

}: AccordionCep) {
    const { allEntityData, eliminarCEP, onRenderJsonEntity } = useContext(CartContext);
    const [isOpen, setIsOpen] = useState(false);
    const [contentClass, setContentClass] = useState(styles['content_collapsed']);
    const [totalFormatter, setTotalFormatter] = useState('');
    const [loading, setLoading] = useState(false);
    const [blockDialogData, setBlockDialogData] = useState({
        mensajeDialog: "",
        titleDialog: "ATENCIÓN",
        open: false,
        closable: false
    });

    const onClickAccordion = () => {
        if (isOpen) {
            setContentClass(styles['content_collapsed']);
        } else {
            setContentClass('')
        }
        setIsOpen(!isOpen);
    }

    const onDeleteItem = async () => {
        setLoading(true);
        try {
            setBlockDialogData({
                ...blockDialogData,
                open: false
            });
            eliminarCEP(cepData.num_cep);
            await onRenderJsonEntity();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // Calcula el total a mostrar del CEP
    const calculateTotal = () => {
        let total = 0;
        cepData.results.map((item: any) => {
            total += parseFloat(item.amount);
        });
        setTotalFormatter(`$${formatPrice(total.toString())}`)
    };

    // Calcula el alto del accordion teniendo en cuenta los items que hay
    const calculateHeigthAccordion = () => {
        const height = (cepData.length + 1) * 31;
        return `${height}px`;
    }

    // Crea los items del CEP
    const generateItems = () => {
        const items: any = [];
        let topPosition = 0;
        cepData.results.map((item: any) => {
            // Agregamos item
            items.push(
                <div key={item.description} className={styles['item_cep']} style={{ top: `-${topPosition}px` }}>
                    <img className="mr-2" src="../item_cep.png" />
                    <div className={styles['item_cep__text']} >{item.description}</div>
                    <div className={styles['item_cep__amount']} >{'$' + formatPrice(item.amount.toString())}</div>
                </div>
            );
            // Calculamos el nuevo valor para top
            topPosition += 31;
        })

        return items;
    }

    const footerContent = (
        <div>
            <Button label="Cancelar" onClick={() => setBlockDialogData({
                ...blockDialogData,
                open: false
            })} className="p-button-text p-button-danger" />
            <Button label="Continuar" className="button-pdp" onClick={onDeleteItem} />
        </div>
    );

    useEffect(() => {
        calculateTotal();
    }, [allEntityData])

    return (
        <>
            {loading && <Loader />}
            <Dialog draggable={false}  breakpoints={{ '2560px': '30vw','1024px': '40vw','768px': '70vw', '425px': '90vw' }} headerClassName='custom_dialog_header' header={blockDialogData.titleDialog} visible={blockDialogData.open} footer={footerContent}  closable={blockDialogData.closable} onHide={() => setBlockDialogData({ ...blockDialogData, open: false })}>
                <p>{blockDialogData.mensajeDialog}</p>
            </Dialog>
            <div className={styles['accordion']}>
                <div className={styles['accordion_header']}>
                    <div className={styles['left_header']}>
                        <div className={["mr-2", styles['accordion_header__btn_open']].join(" ")} >
                            <i className="pi pi-chevron-down" onClick={onClickAccordion}></i>
                        </div>
                        <div>N° BEP {nroCep}</div>
                    </div>

                    <div className={styles['right_header']}>
                        <div className={styles['header_total']}>
                            {totalFormatter}
                        </div>
                        <div className="ml-3">
                            <i className="pi pi-trash action_btn_table" onClick={() => setBlockDialogData({
                                ...blockDialogData,
                                open: true,
                                mensajeDialog: `Al eliminar el BEP "${cepData.num_cep}" se eliminará de todos los grupos relacionados al mismo`
                            })}></i>
                        </div>
                    </div>
                </div>
                <div style={{ height: calculateHeigthAccordion() }} className={[styles['accordion_content'], contentClass].join(" ")}>
                    {generateItems()}
                </div>

            </div>

        </>
    )
}