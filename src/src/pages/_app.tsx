import '@/styles/globals.css';
import '@/styles/layout.css';
import type { AppProps } from 'next/app';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import spanishTranslation from '@/services/spanishTranslation';
import CheckRoutes from '@/components/CheckRoutes/CheckRoutes';
import { NavBarContextProvider } from '@/context/NavBarContext';
// Traduccion a español de componentes primereact
spanishTranslation();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NavBarContextProvider>
      <CheckRoutes>
        <Component {...pageProps} />
      </CheckRoutes>
    </NavBarContextProvider>

  )
}
