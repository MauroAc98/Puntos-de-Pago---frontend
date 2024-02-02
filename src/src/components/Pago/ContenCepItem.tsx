import { useEffect } from "react"

interface ContentCepItemInterface {
    nroCep: number
    itemData: any
}

export default function ContentCepItem({
    nroCep,
    itemData
}: ContentCepItemInterface) {

    useEffect(() => {
        console.log(itemData);
    }, []);

    return (
        <>{nroCep}</>
    )
}