
// Query para chequear si me permite estar logueado
export const isAlive = (pathname: string) => {
    if (pathname === "/") {
        return new Promise(async (resolve, reject) => {
            try {
                // Hago llamada
                const cli: any = process.env.cli;
                const response = await fetch(`${process.env.urlback}/is_alive_several`, {
                    headers: {
                        'cli': cli,
                    },
                    credentials: 'include',
                });
                // Obtengo datos de respuesta
                const data: any = await response.json();

                // Si hay errores
                if (!response.ok) {
                    reject(data);
                    return;
                }

                // Si esta todo OK
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    } else if (pathname == '/apps/pagar-cep') {
        return new Promise(async (resolve, reject) => {
            try {
                // Hago llamada
                const cli: any = process.env.cli;
                const response = await fetch(`${process.env.urlback}/is_alive_pagar_cep`, {
                    headers: {
                        'cli': cli,
                        'pathname': pathname
                    },
                    credentials: 'include',
                });
                // Obtengo datos de respuesta
                const data: any = await response.json();

                // Si hay errores
                if (!response.ok) {
                    reject(data);
                    return;
                }

                // Si esta todo OK
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });

    } else {
        return new Promise(async (resolve, reject) => {
            try {
                // Hago llamada
                const cli: any = process.env.cli;
                const response = await fetch(`${process.env.urlback}/is_alive`, {
                    headers: {
                        'cli': cli,
                        'pathname': pathname
                    },
                    credentials: 'include',
                });
                // Obtengo datos de respuesta
                const data: any = await response.json();

                // Si hay errores
                if (!response.ok) {
                    reject(data);
                    return;
                }

                // Si esta todo OK
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
}