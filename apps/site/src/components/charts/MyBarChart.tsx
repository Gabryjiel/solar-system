import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const MyBarChart: React.FC<{
  data?: { name: string | number; value: number }[];
}> = (props) => {
  const [isPortrait, setIsPortrait] = useState(screen.height > screen.width);
  const layout = isPortrait ? "vertical" : "horizontal";

  useEffect(() => {
    const changeOrientation = () => {
      setIsPortrait(screen.height > screen.width);
    };

    addEventListener("orientationchange", changeOrientation);

    return () => {
      removeEventListener("orientationchange", changeOrientation);
    };
  }, []);

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
    <div id="wrapper" className="w-full h-full">
      <ResponsiveContainer height="100%">
        <BarChart data={props.data} layout={layout}>
          <CartesianGrid />
          {isPortrait ? (
            <>
              <YAxis dataKey="name" type="category" />
              <XAxis
                dataKey="value"
                type="number"
                domain={[
                  Math.max(dataMin - dataMin * 0.2, 0),
                  Math.round(dataMax + dataMax * 0.2),
                ]}
              />
            </>
          ) : (
            <>
              <XAxis dataKey="name" type="category" />
              <YAxis
                dataKey="value"
                type="number"
                domain={[
                  Math.max(dataMin - dataMin * 0.2, 0),
                  Math.round(dataMax + dataMax * 0.2),
                ]}
              />
            </>
          )}
          <Tooltip />
          <Bar layout={layout} dataKey="value" fill="cornflowerblue">
            <LabelList
              dataKey="value"
              position={isPortrait ? "right" : "top"}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
