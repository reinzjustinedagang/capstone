// src/components/charts/chartConfig.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement, // ✅ use LineElement instead of Line
  PointElement, // ✅ usually needed for line charts
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement, // ✅ correct element
  PointElement // ✅ important for line charts
);
