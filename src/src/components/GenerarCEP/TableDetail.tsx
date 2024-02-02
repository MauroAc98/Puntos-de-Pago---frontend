import Table from '@/components/Table/Table';
import { Button } from "primereact/button";
import { useEffect, useState } from 'react';

interface TableDetailProps {
    data: any,
    setShowDetail: any,
}

export default function TableDetail({
    data,
    setShowDetail,
}: TableDetailProps) {

    const [columns, setColumns] = useState([]);
    const [body, setBody] = useState<any>([]);

    useEffect(() => {


        const header = data.map((elemento: any) => {
            return {
                field: elemento.titulo,
                name: elemento.titulo,
                visibility: true,
                align: elemento.align
            };
        });


        const nuevoJSON: any = {};

        data.forEach((item: any) => {
            const clave = item.titulo;
            const valor = item.d_valor;
            nuevoJSON[clave] = valor;
        });
        setBody([nuevoJSON]);
        setColumns(header);        
    }, []);


    return (
        <>
            <Table
                data={body}
                columns={columns}
                isPaginator={false}
            />
            <div className="mt-5 text-center">
                <Button onClick={() => setShowDetail(false)} type='button' label="VOLVER" className="mr-2 btn_violet" />
            </div>
        </>
    )
}