import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController
);

export const options = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  stacked: false,
  plugins: {
    title: {
      display: true,
      text: 'Valor e Volume',
    },
  },
  scales: {
    yAxes: [
      {
        id: 'A',
        type: 'linear',
        position: 'left',
      },
      {
        id: 'B',
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    ],
  },
};

export const datasample = {
  labels: [],
  datasets: [
    {
      type: 'line',
      label: 'Último',
      borderColor: 'rgb(255, 99, 132)',
      borderWidth: 2,
      fill: false,
      yAxisID: 'A',
      data: [],
    },
    {
      type: 'bar',
      label: 'Volume',
      backgroundColor: 'rgb(75, 192, 192)',
      data: [],
      borderColor: 'white',
      borderWidth: 2,
      yAxisID: 'B',
    },
  ],
};

const IntradayChartJS2 = ({ data }) => {
  const dataChart = {
    labels: Object.keys(data).map(k => format(new Date(k),'kk:mm')),
    datasets: [
      {
        ...datasample.datasets[0],
        data: Object.keys(data).map((k) => data[k].grsstradamt),
      },
      {
        ...datasample.datasets[1],
        data: Object.keys(data).map((k) => data[k].tradqty),
      },
    ],
  };
  console.log('dataChart', dataChart);
  return <Chart type="bar" options={options} data={dataChart} />;
};
export default IntradayChartJS2;
