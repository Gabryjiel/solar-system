import { Chart, ChartConfiguration, ChartConfigurationCustomTypesPerDataset, registerables } from "chart.js";
import { ComponentProps, createSignal, onCleanup, onMount } from "solid-js"

Chart.register(...registerables);

type Props = {
  chartOptions?: ChartConfiguration | ChartConfigurationCustomTypesPerDataset;
  canvasOptions?: ComponentProps<'canvas'>;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export function months(config) {
  var cfg = config || {};
  var count = cfg.count || 12;
  var section = cfg.section;
  var values = [];
  var i, value;

  for (i = 0; i < count; ++i) {
    value = MONTHS[Math.ceil(i) % 12];
    values.push(value.substring(0, section));
  }

  return values;
}

export function SolidCanvas(props: Props) {
  let ref: HTMLCanvasElement | null = null;
  const [chart, setChart] = createSignal<Chart | null>(null);

  onMount(() => {
    setChart(new Chart(ref.getContext('2d'), props.chartOptions));
  })

  onCleanup(() => {
    chart().destroy();
  })

  return <canvas {...props.canvasOptions} ref={ref}></canvas>
}