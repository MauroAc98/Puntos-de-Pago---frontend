
import AccordionCep from "@/components/Pago/AccordionCep";
import { InputText } from "primereact/inputtext";
import styles from "./entityContent.module.css";
import { formatPrice } from "@/services/helpers";

interface EntityContentCeps {
    ceps: any
    total: any
}

export default function EntityContentCeps({
    ceps, total
}: EntityContentCeps) {


    return (
        <>
            {Object.keys(ceps).map((item: any) => {
                return (
                    <AccordionCep
                        key={item}
                        nroCep={ceps[item].num_cep}
                        cepData={ceps[item]}
                    />
                );
            })}
            <div className="flex justify-content-start">
                <div className="flex align-items-center">
                    <label className={['block', styles['title_total']].join(" ")}>TOTAL</label>
                </div>
                <div className="flex align-items-end ml-5">
                    <InputText
                        className={['block', styles['total']].join(" ")}
                        readOnly
                        value={'$' + formatPrice(total.toString())}
                    />
                </div>
            </div>
        </>
    )
}