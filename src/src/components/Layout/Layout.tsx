import { useRouter } from "next/router";
import Navbar from "./Navbar";

interface LayoutInter {
    children: any;
}

export default function Layout({ children }: LayoutInter) {
    const router = useRouter();

    // Si es una pagina de error no mostramos el layout
    if (router.pathname === "/_error") {
        return children;
    }

    return (
        <>
            <Navbar />
            <div className="container_page">
                {children}
            </div>
        </>
    )
}