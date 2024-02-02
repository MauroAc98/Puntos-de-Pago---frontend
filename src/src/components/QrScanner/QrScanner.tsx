//@ts-ignore
import QrReader from "react-qr-reader";
import style from './QrScanner.module.css';

interface qrScannerProps {
    handleErrorScan?: any,
    handleScan: any
}
export function QrScanner({ handleScan }: qrScannerProps) {
    return (
        <>
            <div className={style['back_loader']}></div>
            <div id={style['boxLoader']}>
                <div className='flex align-items-center justify-content-center h-full w-full'>
                    <div className={style['centered_box']}>
                        <QrReader delay={300} onScan={handleScan} onError={console.error} className={style['scanner']}></QrReader>
                    </div>
                </div>
            </div>

        </>
    )
}
