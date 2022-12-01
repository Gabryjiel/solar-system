import { useEffect, useState } from "react";
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
import { z } from "zod";

import { useDebounce } from "../../utils/hooks/useDebounce";

export const MyBarChart: React.FC<{
  data?: { name: string | number; value: number }[];
  drillDown?: (date: string) => void;
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

  const handleLabelDoubleClick = useDebounce((event: unknown) => {
    const schema = z.object({
      name: z.string().or(z.number()),
    });
    const result = schema.parse(event).name.toString();
    console.log(result);
    props.drillDown?.(result);
  }, 100);

  const isReady = (props.data?.length ?? 0) > 0;

  return (
    <div id="wrapper" className="w-full h-full">
      {isReady ? (
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
            <Tooltip
              content={(props) => {
                const value = props.payload?.at(0)?.value ?? 0;
                const date = props.payload?.at(0)?.payload.name ?? "";

                return (
                  <div className="h-16 w-48 bg-slate-100 border-2 border-black flex flex-col justify-center p-2">
                    <div>
                      <span>{"Wartość: "}</span>
                      <span>{value}</span>
                    </div>
                    <div>
                      <span>{"Data: "}</span>
                      <span>{date.toString()}</span>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              layout={layout}
              dataKey="value"
              fill="cornflowerblue"
              onDoubleClick={handleLabelDoubleClick}
            >
              <LabelList
                dataKey="value"
                position={isPortrait ? "right" : "top"}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <span className="text-2xl font-bold text-blue-600">
            Brak danych za ten okres
          </span>
          <span className="text-xl font-bold text-blue-600">Zmień okres</span>
        </div>
      )}
    </div>
  );
};
