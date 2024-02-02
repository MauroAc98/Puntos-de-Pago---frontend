import ResultTable from '@/components/ConsultarCEP/ResultTable';
import SearchCEP from '@/components/ConsultarCEP/SearchCEP';
import NavBarContext from '@/context/NavBarContext'
import React, { useContext, useEffect, useState } from 'react'

export default function ConsultarCEP() {
  const { setPageTitle } = useContext(NavBarContext);

  const [columnsResult, setColumnsResult] = useState([]);
  const [dataResult, setDataResult] = useState([]);
  const [showResultTable, setShowResultTable] = useState(false);

  /** Funcion para limpiar estados de esta pagina */
  const initialPageState = () => {
    setDataResult([]);
    setColumnsResult([]);
    setShowResultTable(false);
  }

  useEffect(() => {
    setPageTitle('Consultar BEP');
  }, []);
 
  return (
    <>
      <SearchCEP
        setColumnsResult={setColumnsResult}
        setDataResult={setDataResult}
        setShowResultTable={setShowResultTable}
        initialPageState={initialPageState}
      />
      {dataResult.length !== 0 && <ResultTable
        dataResult={dataResult}
        setDataResult={setDataResult}
      />}
    </>
  )
}
