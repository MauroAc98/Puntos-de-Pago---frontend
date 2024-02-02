import { Accordion, AccordionTab } from 'primereact/accordion';
import styles from "./entityContent.module.css";
import EntityContentCeps from './EntityContentCeps';
import Pagos360 from '../PaymentMethod/Pagos360';
import MacroClick from '../PaymentMethod/MacroClick';
import { useEffect, useState } from 'react';
import EPagos from '../PaymentMethod/EPagos';
import { formatPrice } from '@/services/helpers';


interface EntityContentTab {
    data: any
}
export default function EntityContentTab({
    data
}: EntityContentTab) {

    const [totalGroup, setTotalGroup] = useState(0);

    const sumTotalGroup = () => {
        let totalAmount = 0;
        data.ceps.forEach((item: any) => {
            item.results.forEach((result: any) => {
                totalAmount += parseFloat(result.amount);
            });
        });
        setTotalGroup(totalAmount);
    }

    useEffect(() => {
        sumTotalGroup();
    }, [data])

    return (
        <>
            <div className={['grid', styles['entity_content']].join(" ")}>
                <div className={["col-12 lg:col-6", styles['left_data']].join(" ")}>
                    <EntityContentCeps
                        ceps={data.ceps}
                        total={totalGroup}
                    />
                </div>
                <div className="col-12 lg:col-6">
                    <Accordion activeIndex={0}>
                        {data.paymentMethod.map((item: any) => (
                            <AccordionTab key={item.methodId} header={item.name} headerClassName={styles['header_tab']}>
                                {item.methodId === process.env.method_id_macro_click ? <MacroClick DataEntity={data} item={item} total={formatPrice(totalGroup.toString())}/> : null}
                                {item.methodId === process.env.method_id_360 ? <Pagos360 DataEntity={data} item={item} /> : null}
                                {item.methodId === process.env.method_id_e_pagos ? <EPagos item={item} total={totalGroup}/> : null}
                            </AccordionTab>
                        )
                        )}
                    </Accordion>
                </div>
            </div>
        </>
    )
}