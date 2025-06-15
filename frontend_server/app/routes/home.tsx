import type { Route } from "./+types/home";
import { useEffect, useRef } from "react";
import { useLoaderData } from "react-router";
import pkg from 'lodash';
const { range } = pkg;
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Mock Calculus & Statistics - Math 301" },
    { name: "description", content: "Mocking mathematics course with interactive charts and data visualization" }
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const mathData = {
    calculus: Array(500).fill(0).map((_, i) => ({
      x: i / 10,
      sin: Math.sin(i / 10),
      cos: Math.cos(i / 10),
      tan: Math.tan(i / 10),
      derivative: Math.cos(i / 10) * 0.1,
      integral: -Math.cos(i / 10) * 10
    })),
    statistics: Array(1000).fill(0).map(() => ({
      normal: Math.random() * 2 - 1,
      exponential: -Math.log(Math.random()),
      uniform: Math.random(),
      binomial: Math.floor(Math.random() * 20)
    })),
    algebra: Array(200).fill(0).map((_, i) => ({
      polynomial: i ** 3 - 2 * i ** 2 + i - 1,
      exponential: Math.exp(i / 50),
      logarithm: Math.log(i + 1),
      quadratic: i ** 2 - 3 * i + 2
    }))
  };

  return { mathData, timestamp: Date.now() };
}

export default function Home() {
  const { mathData } = useLoaderData<typeof loader>();
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const charts = [
      { type: 'line', data: mathData.calculus.map(d => ({ x: d.x, y: d.sin })), title: 'Sin Function', color: 'rgb(255, 99, 132)' },
      { type: 'line', data: mathData.calculus.map(d => ({ x: d.x, y: d.cos })), title: 'Cos Function', color: 'rgb(54, 162, 235)' },
      { type: 'line', data: mathData.calculus.map(d => ({ x: d.x, y: d.derivative })), title: 'Derivative', color: 'rgb(255, 205, 86)' },
      { type: 'histogram', data: mathData.statistics.map(d => d.normal), title: 'Normal Distribution', color: 'rgb(75, 192, 192)' },
      { type: 'scatter', data: mathData.algebra.map((d, i) => ({ x: i, y: d.polynomial })), title: 'Polynomial', color: 'rgb(153, 102, 255)' },
      { type: 'bar', data: mathData.statistics.slice(0, 50).map(d => d.binomial), title: 'Binomial Data', color: 'rgb(255, 159, 64)' }
    ];

    charts.forEach((chart, idx) => {
      const canvas = canvasRefs.current[idx];
      if (canvas) {
        new ChartJS(canvas, {
          type: chart.type === 'histogram' ? 'bar' : chart.type === 'scatter' ? 'scatter' : chart.type,
          data: {
            labels: chart.type === 'histogram' ? range(20).map(i => (i - 10).toFixed(1)) :
              chart.type === 'bar' ? range(chart.data.length).map(i => `Sample ${i}`) :
                chart.data.map((_, i) => i),
            datasets: [{
              label: chart.title,
              data: chart.type === 'histogram' ?
                Array(20).fill(0).map((_, i) => chart.data.filter(d => d >= i - 10 && d < i - 9).length) :
                chart.data,
              backgroundColor: chart.color,
              borderColor: chart.color,
              borderWidth: 2
            }]
          },
          options: { responsive: true, plugins: { title: { display: true, text: chart.title } } }
        });
      }
    });
  }, [mathData]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Advanced Calculus & Statistics</h1>
        <p className="text-xl text-gray-600">Math 301 - Interactive Data Visualization</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {range(6).map(i => (
          <div key={i} className="bg-white rounded-lg shadow-lg p-6">
            <canvas ref={el => canvasRefs.current[i] = el} className="w-full h-64" />
          </div>
        ))}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Course Data Summary</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">{mathData.calculus.length}</div>
            <div className="text-gray-600">Calculus Points</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600">{mathData.statistics.length}</div>
            <div className="text-gray-600">Statistical Samples</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600">{mathData.algebra.length}</div>
            <div className="text-gray-600">Algebraic Functions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
