
import { addLocale, locale } from 'primereact/api';

export default function spanishTranslation() {
    addLocale('es', {
        firstDayOfWeek: 1,
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        clear: 'Limpiar',
        startsWith: 'Comienza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'No es igual a',
        noFilter: 'Sin filtro',
        emptyMessage: 'Sin resultados',
        lt: 'Menor que',
        lte: 'Menor que o igual a',
        gt: 'Mayor que',
        gte: 'Mayor que o igual a',
        dateIs: 'Fecha igual a',
        dateIsNot: 'Fecha no es igual a',
        dateBefore: 'Fecha anterior a',
        dateAfter: 'Fecha posterior a',
    });
    locale('es');
}