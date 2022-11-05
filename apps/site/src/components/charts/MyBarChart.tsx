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
  const dataMin =
    props.data?.reduce(
      (all, cur) => (cur.value < all ? cur.value : all),
      props.data[0]?.value ?? 0
    ) ?? 0;

  const dataMax =
    props.data?.reduce(
      (all, cur) => (cur.value > all ? cur.value : all),
      props.data[0]?.value ?? 0
    ) ?? 0;

  return (
    <ResponsiveContainer width="100%">
      <BarChart data={props.data} layout="vertical">
        <CartesianGrid />
        <YAxis dataKey="name" type="category" />
        <XAxis
          dataKey="value"
          type="number"
          domain={[
            Math.max(dataMin - dataMin * 0.2, 0),
            Math.round(dataMax + dataMax * 0.2),
          ]}
        />
        <Tooltip />
        <Bar layout="vertical" dataKey="value" fill="cornflowerblue">
          <LabelList dataKey="value" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
