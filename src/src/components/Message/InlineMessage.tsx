import { Messages } from 'primereact/messages';
import { useEffect, useRef } from 'react';

interface InlineMessageProps {
    severity: string,
    detail: string,
    closable: boolean

}
export default function InlineMessage(props: InlineMessageProps) {
    const msgRef = useRef<any>(null);

    useEffect(() => {
        msgRef.current.show({
            severity: props.severity,
            detail: props.detail,
            sticky: true,
            closable: props.closable
        });
    }, [])
    return (
        <Messages ref={msgRef} />
    )
}