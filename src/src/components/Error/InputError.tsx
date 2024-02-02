interface InputErrorInterface {
    name: any
    text: string
}
export default function InputError(props: InputErrorInterface) {
    return (
        <small className="p-error block">{props.text}</small>
    )
}