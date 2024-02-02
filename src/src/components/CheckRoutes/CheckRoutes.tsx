import Layout from '@/components/Layout/Layout';
import { ToastContextProvider } from '@/context/ToastContext';
import { CartContextProvider } from '@/context/CartContext';
import { LoginContextProvider } from '@/context/LoginContext';
import { DataUserContextProvider } from '@/context/DataUserContext';
import { useRouter } from 'next/router';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { isAlive } from '@/services/isAliveService';
import { Loader } from '@/components/Loader/Loader';
import { removeCookies } from '@/services/api';
import NavBarContext from '@/context/NavBarContext';


interface CheckRoutesProps {
  children: ReactNode;
}

export default function CheckRoutes({ children }: CheckRoutesProps) {
  const { setUserLogged, setIsLogged, setHomeUri, userLogged } = useContext(NavBarContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // TODO: Quitar eliminacion de cookies cuando tenga http only
  const verifyRoute = async () => {
    const { pathname } = router;
    const redirect_to = router.query?.redirect_to ? `&redirect_to=${router.query?.redirect_to}` : "";

    try {

      // Rutas publicas que no requieren ningun dato
      if (pathname == '/operCancelada') {
        setLoading(false);
        return;
      }

      // Si quiero acceder a login, verifico si estoy logueado
      if (pathname === '/') {
        // Ejecuto isAlive only login
        const data: any = await isAlive(pathname);

        // Si ya estoy logueado, redirijo a home
        if (data.state == "LOGGED") {
          router.push("/apps/consultar-cep");
          return;
        }
      }


      if (pathname == '/apps/pagar-cep') {
        // Ejecuto isAlive only login
        const data: any = await isAlive(pathname);

        // Si ya estoy logueado, redirijo a home
        if (data.state == "LOGGED") {
     
          const { userData } = data;
          // Seteamos estados
          setIsLogged(true);
          setUserLogged({ user: userData.user, entorno: userData.entorno, deno: userData.deno });
          setHomeUri(userData.home);
        } else if (data.state == "ENTORNO_NOOK") {
          router.push(`/?environmenterror=true${redirect_to}`);
          removeCookies();
          return;
        }
      }

      // Si ingreso a rutas privadas
      if (pathname !== '/' && pathname !== '/apps/pagar-cep' && pathname !== '/security') {
        // Ejecuto isAlive comun
        const data: any = await isAlive(pathname);

        // Si mi respuesta es ENTORNO_NOOK, redirijo al login
        if (data.state == "ENTORNO_NOOK") {
          router.push(`/?environmenterror=true${redirect_to}`);
          removeCookies();
          return;
        }

        // Si mi respuesta es diferente de OK, redirijo al login
        if (data.state !== "OK") {
          router.push(`/?requiredlog=true${redirect_to}`);
          removeCookies();
          return;
        }

        // Datos de usuario
        const { userData } = data;

        // Seteamos estados
        setIsLogged(true);
        setUserLogged({ user: userData.user, entorno: userData.entorno, deno: userData.deno });
        setHomeUri(userData.home);
      }

      // Si todo esta OK
      setLoading(false);

    } catch (error) {
      router.push(`/?requiredlog=true${redirect_to}`);
      removeCookies();
    }
  }

  /** Verifica de acuerdo a la ruta, que componentes renderizar */
  const renderData = () => {
    // Rutas sin layout
    if (['/'].includes(router.pathname) || ['/security'].includes(router.pathname) || ['/operCancelada'].includes(router.pathname)) {
      return children;
    } else if (router.pathname === '/apps/pagar-cep') {
      // Rutas con layout
      return (
        <Layout>
          {children}
        </Layout >
      )
    } else {
      return (
        userLogged ? <Layout>
          {children}
        </Layout> : <><Loader /> </>)
    }
  }


  /** Verificamos si puede acceder a la ruta o no */
  useEffect(() => {
    if (router.isReady) {
      verifyRoute();
    }
  }, [router.pathname, router.isReady]);

  if (loading) {
    return <Loader />
  }

  return (
    <>
      <LoginContextProvider>
        <ToastContextProvider>
          <CartContextProvider>
            <DataUserContextProvider>
              {renderData()}
            </DataUserContextProvider>
          </CartContextProvider>
        </ToastContextProvider>
      </LoginContextProvider>
    </>
  );
}
