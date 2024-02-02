
import React, { useEffect, useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface ReportDetailProps {
    dataPreview?: any
}

export default function ReportDetail({
    dataPreview
}: ReportDetailProps) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [pdfUrl, setPdfUrl] = useState('');
    const [initialZoom, setInitialZoom] = useState(1.0);
    useEffect(() => {
        // Convierte el objeto Blob en una URL de objeto
        if (dataPreview) {
            const dataUrl = URL.createObjectURL(dataPreview);
            setPdfUrl(dataUrl);
        }

        //libera la URL de objeto cuando el componente se desmonte
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [dataPreview]);


    return (
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
            <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} defaultScale={initialZoom} />
        </Worker>
    )
}