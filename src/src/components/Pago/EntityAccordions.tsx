import { useContext, useEffect, useState } from "react"
import { Accordion, AccordionTab } from 'primereact/accordion';
import EntityContentTab from "@/components/Pago/EntityContentTab";
import styles from "./entityAccordions.module.css";
import CartContext from "@/context/CartContext";

interface EntityAccordionsProps {
    indexAdded: number | null
}

export default function EntityAccordions({
    indexAdded
}: EntityAccordionsProps) {
    const { allEntityData } = useContext(CartContext);

    const [activeIndex, setActiveIndex] = useState(0);

    // Cada vez que añadimos un nuevo cep, abrimos el accordion correspondiente
    useEffect(() => {
        if (indexAdded !== null) {
            setActiveIndex(indexAdded);
        }
    }, [indexAdded])

    return (
        <>
            <div className="col-12">
                <Accordion activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    {allEntityData.map((item: any) => {
                        return (
                            <AccordionTab
                                key={item.entity}
                                header={item.description}
                                headerClassName={styles['header_tab']}
                            >
                                <EntityContentTab
                                    data={item}
                                />
                            </AccordionTab>
                        )
                    })}
                </Accordion>
            </div>
        </>
    )
}