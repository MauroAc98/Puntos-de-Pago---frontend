import sha256 from "sha256";

//funcion para encriptar string en sha1
export function SHA1(msg: any) {
    function rotate_left(n: any, s: any) {
        var t4 = (n << s) | (n >>> (32 - s));
        return t4;
    };
    function lsb_hex(val: any) {
        var str = '';
        var i;
        var vh;
        var vl;
        for (i = 0; i <= 6; i += 2) {
            vh = (val >>> (i * 4 + 4)) & 0x0f;
            vl = (val >>> (i * 4)) & 0x0f;
            str += vh.toString(16) + vl.toString(16);
        }
        return str;
    };
    function cvt_hex(val: any) {
        var str = '';
        var i;
        var v;
        for (i = 7; i >= 0; i--) {
            v = (val >>> (i * 4)) & 0x0f;
            str += v.toString(16);
        }
        return str;
    };
    function Utf8Encode(string: any) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };
    var blockstart;
    var i, j;
    var W = new Array(80);
    var H0 = 0x67452301;
    var H1 = 0xEFCDAB89;
    var H2 = 0x98BADCFE;
    var H3 = 0x10325476;
    var H4 = 0xC3D2E1F0;
    var A, B, C, D, E;
    var temp;
    msg = Utf8Encode(msg);
    var msg_len = msg.length;
    var word_array = new Array();
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 |
            msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }
    switch (msg_len % 4) {
        case 0:
            i = 0x080000000;
            break;
        case 1:
            i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
            break;
        case 2:
            i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
            break;
        case 3:
            i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
            break;
    }
    word_array.push(i);
    while ((word_array.length % 16) != 14) word_array.push(0);
    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
        for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i];
        for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 20; i <= 39; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 40; i <= 59; i++) {
            temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        for (i = 60; i <= 79; i++) {
            temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = rotate_left(B, 30);
            B = A;
            A = temp;
        }
        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }
    var temp: any = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
}

// Funcion para seleccionar colores random dentro de esta paleta
export const randomColor = () => {
    
    const colors = [
        '#633974', // Púrpura oscuro
        '#B08FC7', // Púrpura claro
        '#BF1F48', // Rojo oscuro
        '#FF7272', // Rojo claro
        '#9A4C7B', // Púrpura medio
        '#D64B59', // Rojo medio
        '#FF8BC6', // Rosa claro
        '#FF6E97', // Rosa medio
        '#2A3E5A', // Azul
        '#8E285E', // Púrpura rojizo
        '#5E5E5E', // Gris
        '#408080', // Azul verdoso
        '#A0522D', // Marrón
        '#800080', // Púrpura intenso
        '#008000', // Verde intenso
        '#FF4500', // Naranja oscuro
        '#006400', // Verde oscuro
        '#800000', // Rojo intenso
        '#4B0082', // Índigo
    ];
    
    
    
    let index = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
    return colors[index];
}

/** Funcion para formatear con separador de miles */
export const formatPrice = (price: string) => {
    const priceFormated = Intl.NumberFormat("es-AR", {
        style: "decimal", maximumFractionDigits: 2, minimumFractionDigits: 2, useGrouping: true,
        currency: "ARS",
        currencyDisplay: "symbol",
    }).format(parseFloat(price));
    return priceFormated;
}

export const formatCUIT = (cuit: any) => {
    // Agregamos los guiones
    cuit = cuit.replace(/^(\d{2})(\d{8})(\d{1})$/, "$1-$2-$3");
    return cuit;
}

export const openPdf = (data: any) => {
    const file = new Blob([data], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
}


export const formatDateForMySql = (fecha: any) => {
    const anio = fecha.getFullYear();
    const mes = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const dia = ('0' + fecha.getDate()).slice(-2);
    const fechaFormateada = anio + '-' + mes + '-' + dia;
    return fechaFormateada;
}

export const generationUniqueKey = () => {
    const storedKey = sessionStorage.getItem('id_session_my_sql');

    if (storedKey) return;
    const generatedIdSession = Date.now().toString();
    sessionStorage.setItem('id_session_my_sql', sha256(generatedIdSession));
}


export const formattedPosFiscal = (value: any) => {
    return value !== null ? value.replace(/^(\d{4})(\d{2})/, '$1/$2') : undefined
}

export const unformatterPosFiscal = (value: any) => {
    return value !== null ? value.replace(/[^\d]/g, '') : undefined
}


/** Funcion que deselecciona filas seleccionadas en un componente datatable (quita la clase row_selected a todas las filas) */
export const clearSelectedTableRows = (parentBody: any) => {
    const elementosHijos = parentBody.children;
    for (let i = 0; i < elementosHijos.length; i++) {
        elementosHijos[i].classList.remove('row_selected');
    }
}

/** Funcion que genera un array de filtros de acuerdo a un objeto
 * ---------Ejemplo Formato Generado-------
[
    {"field": "cuit", "oper": "=", "value": "20123456783"},
    {"field": "tributo", "oper": "=", "value":""},   
]
 */
export const generateFilters = (data: any) => {
    let arrayFilter: any = [];
    Object.keys(data).map((item: any) => {
        let newObj = {
            field: item,
            oper: "=",
            value: data[item]
        };
        arrayFilter = [...arrayFilter, newObj];
    });
    return JSON.stringify(arrayFilter);
}

/** Funcion que evalua si un form tiene values vacios */
export const checkEmptyForm = (formData: any) => {
    let isEmpty = true;
    Object.keys(formData).map((item: any) => {
        if (formData[item] !== "" && formData[item] !== null) {
            isEmpty = false;
        }
    });
    return isEmpty;
}

/** Funcion que nos retorna datos utiles de una fila de obligaciones */
export const getOblData = (rowData: any) => {
    // Obtengo datos de fila seleccionada
    const posfiscal = rowData.posFiscalSinFormatear;
    const tributo = rowData.c_tipo_imponible;
    const objeto = rowData.objeto;

    // Obtenog ultimos 4 digitos
    const anio = posfiscal.slice(0, 4);
    // Obtenog ultimos 2 digitos
    const pos = posfiscal.slice(-2);

    return {
        tributo,
        objeto,
        anio,
        pos
    }
}

function encrypt(text: string, algo: string, secret: string, iv: string) {
    const crypto = require('crypto');
    const cipher = crypto.createCipheriv(algo, secret, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return encrypted.toString("hex");
};

// Encrypta AES
export const encryptAes = (data: any) => {
    data = (data !== undefined) ? data : '';
    let secret: string = (process.env['aes_secret'] !== undefined) ? process.env['aes_secret'] : '';
    let iv_key: string = (process.env['aes_iv'] !== undefined) ? process.env['aes_iv'] : '';
    let dataEncryp = encrypt(data, 'aes-256-ctr', secret, iv_key);
    return dataEncryp;
}
