import styles from "@/components/Dashboard/dashboard.module.css";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Dropdown } from "primereact/dropdown";
import { useContext, useState, useEffect } from "react";
import api from "@/services/api";
import ToastContext from "@/context/ToastContext";
import { DashboardData } from "../../pages/apps/dashboard";
import { randomColor } from "@/services/helpers";
import { Loader } from '../Loader/Loader';
import qs from "qs";
import { useRouter } from 'next/router';
import DashboardSkeleton from "@/components/Dashboard/DashboardSkeleton";
import CustomDialogEspera from "@/components/CustomDialog/CustomDialogEspera";


interface DashboardCardProps {
  userData: DashboardData;
}

export default function DashboardCard({ userData }: DashboardCardProps) {
  const [emptyDash, setEmptyDash] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const { showErrorMsg } = useContext(ToastContext);


  const [actualDataDashboard, setActualDataDasboard] = useState({
    idSession: 0,
    d_denominacion: "",
    totalDebt: 0,
    compositionDebt: [{}],
    n_cuit: "",
    amountGroup: ""
  })

  const [dialogData, setDialogData] = useState({
    open: false,
    title: "ATENCIÓN",
    message: "",
    p_m_demora: "",
  });


  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const formatResult = () => {

    let _labels: any = [];
    let _datas: any = [];
    let _backgroundColor: any = [];
    const usedColors = new Set<string>();


    actualDataDashboard?.compositionDebt?.map((item: any) => {
      _labels = [
        ..._labels,
        `${item.groupDebt} - ${item.percentageDebt && item.percentageDebt.startsWith(".")
          ? "0" + item.percentageDebt
          : item.percentageDebt
        }% - $${item.amountGroup}`
      ];

      _datas = [..._datas, item.percentageDebt];


      let color: any = randomColor();
      while (usedColors.has(color)) {
        color = randomColor();
      }

      _backgroundColor = [..._backgroundColor, color];
      usedColors.add(color);
      setChartData({
        labels: _labels,
        datasets: [
          {
            data: _datas,
            backgroundColor: _backgroundColor,
          },
        ],
      });
    })

    if (actualDataDashboard.compositionDebt === undefined || actualDataDashboard.compositionDebt.length === 0 || actualDataDashboard.totalDebt?.toString() === "0,00") {
      setEmptyDash(true)
    } else {
      setEmptyDash(false)
    }

  };


  const options = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 20,
          generateLabels: function (chart: any) {
            const labels = chart.data.labels || [];
            const datasets = chart.data.datasets || [];
            const legendItems: any[] = [];

            labels.forEach((label: any, index: number) => {
              const dataset = datasets[0];
              const backgroundColor = dataset.backgroundColor[index];
              const textBeforeLastHyphen = label.substring(0, label.lastIndexOf('-'));
              const meta = chart.getDatasetMeta(0);
              legendItems.push({
                text: `${textBeforeLastHyphen}`,
                fillStyle: backgroundColor,
                hidden: meta.data[index].hidden
              });
            });
            return legendItems;
          },
        },
        onClick: (e: any, legendItem: any) => {
          const datasetLabel = legendItem.text.trim();
          const chart = e.chart;
          const processedStrings = chart.data.labels.map((string: any) => {
            const partes = string.split('-');
            const resultadoString = partes.slice(0, 2).join('-');
            return resultadoString.trim();
          });

          const datasetIndex = processedStrings.indexOf(datasetLabel);

          if (datasetIndex !== -1) {
            const meta = chart.getDatasetMeta(0);
            if (meta.data[datasetIndex]) {
              meta.data[datasetIndex].hidden = !meta.data[datasetIndex].hidden;
              chart.update();
            }
          }
        },
      },

      tooltip: {
        enabled: true,
        callbacks: {
          label: function () {
            return "";
          },
          title: function (tooltipItems: any) {
            const label = `${tooltipItems[0].label.split('-')[0]} - ${tooltipItems[0].label.split('-')[2]}`
            return label;
          }
        },
        displayColors: false,
      }
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };



  async function recUserDataSelected(event: any) {

    setLoading(true)
    const Event = event?.target?.id === "n_cuit" ? event?.target?.value : userData.data.find(item => item.d_denominacion === event?.target?.value)?.n_cuit;

    try {
      const params = qs.stringify({
        userSelect: Event ? Event : actualDataDashboard.n_cuit,
        p_m_acepta_esperar: dialogData.p_m_demora === 'S' ? 'S' : 'N'
      })
      const { data }: any = await api.post("/getDataUser", params);
      if (data?.p_m_demora === 'S') {
        setDialogData({ ...dialogData, open: true, message: data.message, p_m_demora: data.p_m_demora })
      }
      const value = Event ? Event : actualDataDashboard.n_cuit;

      const user_select: any = userData.data.find(data => data.n_cuit === value);

      setActualDataDasboard({
        ...actualDataDashboard,
        idSession: data?.idSession,
        totalDebt: data?.totalDebt,
        n_cuit: user_select.n_cuit,
        d_denominacion: user_select.d_denominacion,
        compositionDebt: data?.compositionDebt
      });

    } catch (error) {
      showErrorMsg("Ocurrió un problema. Intente de nuevo.");
    } finally {
      setLoading(false)
    }
  }

  function redirectTooGenerarCep() {
    if (userData.idSession) {
      router.push(`/apps/generar-cep?id_session=${actualDataDashboard.idSession}&selectcuit=${actualDataDashboard.n_cuit}&refresh=SI`, '/apps/generar-cep');
    } else {
      showErrorMsg("Error al llamar generar cep.");
    }
  }


  const onStay = () => {
    recUserDataSelected(null);
    setDialogData({ ...dialogData, open: false, p_m_demora: 'N' })
  }

  const footerContent = (
    <div>
      <Button label="Permanecer Aquí" onClick={onStay} className="p-button-text p-button-danger" />
      <Button label="Generar BEP" className="button-pdp" onClick={() => router.push(`/apps/generar-cep?selectcuit=${actualDataDashboard.n_cuit}&refresh=SI`, '/apps/generar-cep')} />
    </div>
  );

  useEffect(() => {

    if (userData && userData.data) {

      const user_select: any = userData.data.find(data => data.default === 'S');
      if (user_select) {

        setActualDataDasboard({
          ...actualDataDashboard,
          idSession: userData.idSession,
          d_denominacion: user_select.d_denominacion,
          totalDebt: userData.totalDebt,
          n_cuit: user_select.n_cuit,
          compositionDebt: userData.compositionDebt,
        });
      }

      if (userData.compositionDebt.length === 0 && userData.totalDebt.toString() === "0,00") {
        setEmptyDash(true)
      } else {
        setEmptyDash(false)
      }
    }

  }, [userData]);

  useEffect(() => {
    formatResult();
  }, [actualDataDashboard])

  return (
    <>
      <CustomDialogEspera title={dialogData.title} message={dialogData.message} open={dialogData.open} footer={footerContent} setDialogData={setDialogData} dialogData={dialogData} />
      {loading ? (
        <>
          <Loader />
          <DashboardSkeleton />
        </>
      ) : (
        <>
          <div className="grid">
            <div className="col-12 md:col-6 flex align-items-center justify-content-center mb-2">
              <label className="m-2">CUIT</label>
              <Dropdown
                value={actualDataDashboard.n_cuit}
                onChange={recUserDataSelected}
                options={userData.data}
                optionLabel={'n_cuit'}
                optionValue={'n_cuit'}
                id={"n_cuit"}
              />
            </div>
            <div className="col-12 md:col-6 flex align-items-center justify-content-center mb-2">
              <label className="m-2">Denominación </label>
              <Dropdown
                value={actualDataDashboard.d_denominacion}
                onChange={recUserDataSelected}
                options={userData.data}
                optionLabel={'d_denominacion'}
                optionValue={'d_denominacion'}
                id={"d_denominacion"}
                className="w-7"
              />
            </div>

          </div>

          {emptyDash ? <div className={styles["contr_sindeudas"]}>
            {!dialogData.open && <h2 className="titleSinDeuda">El contribuyente no posee deudas.</h2>}
          </div> : <div className="grid">

            <div className="col-12 lg:col-6">
              <div className={styles["dashboard_card"]}>
                <div className={styles["dashboard_card__title"]}>
                  Total Deuda
                </div>
                <div className={styles["dashboard_card__total"]}>
                  ${actualDataDashboard?.totalDebt?.toString()}
                </div>
                <div className="mt-5">
                  <Button
                    onClick={redirectTooGenerarCep}
                    label="GENERAR BOLETA"
                    className={[
                      "w-full p-button-outlined p-button-secondary button-pdp",
                      styles["btn_pagar"],
                    ].join(" ")}
                  />
                </div>
              </div>
            </div>

            <div className="col-12 lg:col-6 ">
              <div className={styles["dashboard_card"]}>
                <div className={styles["dashboard_card__title"]}>
                  Confirmación de Deuda
                </div>
                <div className="card flex justify-content-center">
                  <Chart
                    type="doughnut"
                    data={chartData}
                    className={styles["chart"]}
                    options={options}
                  />
                </div>
              </div>
            </div>
          </div>}
        </>
      )}
    </>
  )
};
