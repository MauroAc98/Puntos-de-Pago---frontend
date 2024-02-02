import { Sidebar } from "primereact/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface PageSidebar {
  showSidebar: boolean;
  setShowSidebar: any;
  isLogged?: boolean;
  homeUri?: string;
  userLogged: any;
}
export default function PageSidebar({
  showSidebar,
  setShowSidebar,
  isLogged,
  homeUri,
  userLogged,
}: PageSidebar) {
  const router = useRouter();
  const [visibleVolver, setVisibleVolver] = useState(false);

  const menu = [
    {
      label: "Dashboard",
      icon: "pi pi-home",
      url: "/apps/dashboard",
      visible: isLogged
        ? userLogged.entorno == "EXT"
          ? true
          : false
        : isLogged,
    },
    {
      label: "Generar BEP",
      icon: "pi pi-plus",
      url: "/apps/generar-cep",
      visible: isLogged
        ? userLogged.entorno == "EXT"
          ? true
          : false
        : isLogged,
    },
    {
      label: "Pagar BEP",
      icon: "pi pi-dollar",
      url: "/apps/pagar-cep",
      visible: isLogged ? userLogged.entorno == 'EXT' : true,
    },
    {
      label: "Consultar BEP",
      icon: "pi pi-folder-open",
      url: "/apps/consultar-cep",
      visible: isLogged,
    },
    {
      label: "Volver",
      icon: "pi pi-arrow-circle-left",
      url: homeUri,
      visible: visibleVolver
    },
  ];

  const handleClickItem = ({ url }: any) => {

    if (url === homeUri) {
      router.back();
    } else {
      router.push(url);
    }
    setShowSidebar(false);
  };

  /** Oculta boton volver de acuerdo al entorno y pathname */
  useEffect(() => {
    if (userLogged?.entorno == "EXT") {
      setVisibleVolver(router.pathname === "/apps/dashboard" ? false : true);
    } else if (userLogged?.entorno == "INT") {
      setVisibleVolver(router.pathname === "/apps/consultar-cep" ? false : true);
    }
  }, [router.pathname, userLogged?.entorno])

  return (
    <Sidebar visible={showSidebar} onHide={() => setShowSidebar(false)}>
      {menu.map((item: any) => {
        if (item.visible) {
          return (
            <div
              key={item.label}
              className={`item_sidebar ${router.pathname === item.url ? 'item-active' : ''}`}
              onClick={() => handleClickItem(item)}
            >
              <i className={` mr-2 ${item.icon} ${router.pathname === item.url ? 'color-icon-active' : ''}`}></i>
              <span>{item.label}</span>
            </div>
          );
        }
      })}
    </Sidebar>
  );
}
