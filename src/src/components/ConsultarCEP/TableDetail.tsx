import Table from '@/components/Table/Table';
import { useEffect, useState } from 'react';

interface TableDetailProps {
    detailsProperties: any,
}

export default function TableDetail({
    detailsProperties,
}: TableDetailProps) {

    const [columns, setColumns] = useState<any>([]);

    useEffect(() => {

        const firstObject = detailsProperties[0];

        const keys = Object.keys(firstObject);

        let col = [] = keys.map((key) => ({
            field: key,
            name: key,
            align: "center",
            visibility: true,
        }));
        setColumns(col);

    }, [detailsProperties])


    return (
        <>
            <h3 className='mb-4'>Detalles</h3>
            <Table
                data={detailsProperties}
                columns={columns}
                isPaginator={false}
            />
        </>
    )
}