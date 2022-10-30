import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const MyBarChart: React.FC<{
  data?: { name: string | number; value: number }[];
}> = (props) => {
  const dataMax =
    props.data?.reduce(
      (all, cur) => (cur.value > all ? cur.value : all),
      props.data[0]?.value ?? 0
    ) ?? 0;

  return (
    <ResponsiveContainer width="100%">
      <BarChart data={props.data}>
        <CartesianGrid />
        <XAxis dataKey="name" />
        <YAxis
          dataKey="value"
          mirror
          domain={[0, Math.ceil(dataMax + dataMax * 0.05)]}
        />
        <Tooltip />
        <Bar dataKey="value" fill="orangered">
          <LabelList dataKey="value" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
