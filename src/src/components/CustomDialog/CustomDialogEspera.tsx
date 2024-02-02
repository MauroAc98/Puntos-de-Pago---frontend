
import { Dialog } from 'primereact/dialog';

export default function CustomDialogEspera(props: any) {
    return (
        <Dialog draggable={false} headerClassName='custom_dialog_header' header={props.title} style={{ width: '70vh' }} visible={props.open} breakpoints={{ '768px': '70vw', '425px': '90vw' }} closable={false} footer={props.footer} onHide={() => props.setDialogData({ ...props.dialogData, open: false })}>
            <ul style={{ margin: '20px' }}>
                <li>{props.message}</li>
            </ul>
        </Dialog>
    )
}