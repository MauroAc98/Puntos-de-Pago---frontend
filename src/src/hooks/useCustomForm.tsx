import { useState } from 'react';

/**
 * 
 * @param initialValues valores iniciales del formulario
 */

export default function useCustomForm(initialValues: any) {
    /** Estado donde se guardara todos los valores del formulario */
    const [formData, setFormData] = useState(initialValues);
    /** Estado donde se guardaran todos los errores */
    const [formErrors, setFormErrors] = useState(initialValues);

    /** Funcion que detecta cambios en los inputs */
    const handleFormChange = ({ target }: any) => {
        // Seteamos valores a formData
        setFormData({ ...formData, [target.name]: target.value });

        // quitamos el msg de error en input
        setFormErrors({ ...formErrors, [target.name]: '' });
    }

    return {
        formData,
        setFormData,
        handleFormChange,
        setFormErrors,
        formErrors
    }
}