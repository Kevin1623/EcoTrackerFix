import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionChartsProps {
  deviceId?: string;
  predictions?: any[];
}

export function PredictionCharts({ deviceId, predictions }: PredictionChartsProps) {
  if (!deviceId || !predictions) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        <p>No prediction data available</p>
      </div>
    );
  }

  // Prepare data for prediction chart
  const labels = predictions.slice(0, 24).map((prediction) => {
    const date = new Date(prediction.predictionFor);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  const predictedValues = predictions.slice(0, 24).map((prediction) => prediction.predictedValue);
  const confidenceValues = predictions.slice(0, 24).map((prediction) => prediction.confidence * 100);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Predicted AQI',
        data: predictedValues,
        borderColor: 'hsl(142, 86%, 28%)',
        backgroundColor: 'hsla(142, 86%, 28%, 0.1)',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Confidence (%)',
        data: confidenceValues,
        borderColor: 'hsl(217, 91%, 59%)',
        backgroundColor: 'hsla(217, 91%, 59%, 0.1)',
        yAxisID: 'y1',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Air Quality Index',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Confidence (%)',
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={chartData} options={options} />
    </div>
  );
}
