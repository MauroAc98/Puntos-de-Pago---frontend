import NavBarContext from '@/context/NavBarContext'
import React, { useContext, useEffect, useState } from 'react'
import { Badge } from 'primereact/badge';
import CartContext from '@/context/CartContext';
import PageSidebar from './PageSidebar';
import api, { removeCookies } from '@/services/api';
import { useRouter } from 'next/router';
import ToastContext from '@/context/ToastContext';

export default function Navbar() {
  const [showSidebar, setShowSidebar] = useState(false);
  const { showErrorMsg, showBackdropLoader, hideBackdropLoader } = useContext(ToastContext);
  const { pageTitle, isLogged, userLogged, homeUri, setUserLogged, setIsLogged } = useContext(NavBarContext);
  const { itemCount } = useContext(CartContext);
  const router = useRouter();

  const handleClickLogout = async () => {
    if (isLogged) {
      showBackdropLoader();
      try {
        const { data } = await api.post('/framework/logout');

        // Si tenemos algun error
        if (data?.state != "OK") {
          showErrorMsg('Ocurrió un error al cerrar sesión. Intente de nuevo')
          return;
        }

        // Si todo esta OK
        removeCookies();
        setUserLogged(null);
        setIsLogged(false);
        localStorage.removeItem('urlSidebar');
        // Redirigimos al login
        router.push('/');

      } catch (error) {
        showErrorMsg('Ocurrió un error al cerrar sesión. Intente de nuevo')
      } finally {
        hideBackdropLoader();
      }
    } else {
      // Redirigimos al login
      router.push('/');
    }

  }

  const handleClickPagar = () => {
    router.push('/apps/pagar-cep');
  }

  return (
    <>
      <header className="header">
        <div className="left_side">
          <div className="bars_icon">
            <i className="pi pi-bars" onClick={() => setShowSidebar(true)}></i>
          </div>
          <div className="page_title">
            {pageTitle}
          </div>
        </div>

        <div className="rigth_side">
          {isLogged && userLogged && (
            <div className="user_text">
              {userLogged?.deno}
            </div>
          )}

          {userLogged?.entorno != 'INT' && <div className="wallet_icon">
            <i className="pi pi-wallet p-overlay-badge" onClick={handleClickPagar}>
              {(itemCount > 0) && <Badge value={itemCount} className='wallet_badge'></Badge>}
            </i>
          </div>}

          <div className="logout_icon">
            <i className={isLogged ? 'pi pi-sign-out' : 'pi pi-sign-in'} onClick={handleClickLogout}></i>
          </div>
        </div>
      </header>

      <PageSidebar
        isLogged={isLogged}
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        homeUri={homeUri}
        userLogged={userLogged}
      />
    </>
  )
}


