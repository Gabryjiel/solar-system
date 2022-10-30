import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  lightFormat,
} from "date-fns";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useState } from "react";

import { trpc } from "../utils/trpc";

const MyBarChart = dynamic(
  () => import("../components/charts/MyBarChart").then((imp) => imp.MyBarChart),
  { ssr: false }
);

type View = "power" | "energy_delta" | "energy_sum";
type Range = "day" | "week" | "month" | "quarter" | "year";

const Home: NextPage = () => {
  const [view, setView] = useState<View>("power");
  const [range, setRange] = useState<Range>("day");
  const [startDate, setStartDate] = useState(new Date());

  const getNowQuery = trpc.logs.getNow.useQuery(
    {},
    {
      refetchInterval: false,
    }
  );

  const getPowerQueryByDay = trpc.logs.getPowerByDay.useQuery(
    { date: startDate },
    {
      enabled: view === "power" && range === "day",
    }
  );

  const getPowerByWeekQuery = trpc.logs.getPowerByWeek.useQuery(
    { startDate: startDate },
    {
      enabled: view === "power" && range === "week",
    }
  );

  const getPowerByMonthQuery = trpc.logs.getPowerByMonth.useQuery(
    { startDate: startDate },
    {
      enabled: view === "power" && range === "month",
    }
  );

  const getPowerByYearQuery = trpc.logs.getPowerByYear.useQuery(
    { startDate: startDate },
    {
      enabled: view === "power" && range === "year",
    }
  );

  const getEnergyByDayQuery = trpc.logs.getEnergyByDay.useQuery(
    { date: startDate },
    {
      enabled: view === "energy_delta" && range === "day",
    }
  );

  const getEnergyByWeekQuery = trpc.logs.getEnergyByWeek.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_delta" && range === "week",
    }
  );

  const getEnergyByMonthQuery = trpc.logs.getEnergyByMonth.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_delta" && range === "month",
    }
  );

  const getEnergyByYearQuery = trpc.logs.getEnergyByYear.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_delta" && range === "year",
    }
  );

  const getEnergyTotalByDayQuery = trpc.logs.getEnergyTotalByDay.useQuery(
    { date: startDate },
    {
      enabled: view === "energy_sum" && range === "day",
    }
  );

  const getEnergyTotalByWeekQuery = trpc.logs.getEnergyTotalByWeek.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_sum" && range === "week",
    }
  );

  const getEnergyTotalByMonthQuery = trpc.logs.getEnergyTotalByMonth.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_sum" && range === "month",
    }
  );

  const getEnergyTotalByYearQuery = trpc.logs.getEnergyTotalByYear.useQuery(
    { startDate: startDate },
    {
      enabled: view === "energy_sum" && range === "year",
    }
  );

  const handleYearChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    const { value } = event.target;

    if (
      value === "day" ||
      value === "week" ||
      value === "month" ||
      value === "quarter" ||
      value === "year"
    ) {
      setRange(value);
    }
  };

  const handleDateChangeBackwards = () => {
    if (range === "day") {
      setStartDate((prev) => addDays(prev, -1));
    } else if (range === "week") {
      setStartDate((prev) => addWeeks(prev, -1));
    } else if (range === "month") {
      setStartDate((prev) => addMonths(prev, -1));
    } else if (range === "quarter") {
      setStartDate((prev) => addQuarters(prev, -1));
    } else if (range === "year") {
      setStartDate((prev) => addYears(prev, -1));
    }
  };

  const handleDateChangeForwards = () => {
    if (range === "day") {
      setStartDate((prev) => addDays(prev, 1));
    } else if (range === "week") {
      setStartDate((prev) => addWeeks(prev, 1));
    } else if (range === "month") {
      setStartDate((prev) => addMonths(prev, 1));
    } else if (range === "quarter") {
      setStartDate((prev) => addQuarters(prev, 1));
    } else if (range === "year") {
      setStartDate((prev) => addYears(prev, 1));
    }
  };

  const { title, subtitle, forwardDisabled, Chart } = (() => {
    return {
      title: (() => {
        if (view === "power") {
          switch (range) {
            case "day":
              return "Średnia moc względem godziny (W)";
            case "week":
              return "Średnia moc względem dnia (W)";
            case "month":
              return "Średnia moc względem tygodnia (W)";
            case "quarter":
              return "Średnia moc względem kwartału (W)";
            case "year":
              return "Średnia moc względem lat (W)";
          }
        }

        return "";
      })(),
      subtitle: (() => {
        switch (range) {
          case "day":
            return startDate.toLocaleDateString();
          case "week":
            return `${lightFormat(startDate, "yyyy-MM-dd")} - ${lightFormat(
              addDays(startDate, 7),
              "yyyy-MM-dd"
            )}`;
          case "month":
            return startDate.toJSON();
          case "quarter":
            return startDate.toJSON();
          case "year":
            return startDate.toJSON();
        }
      })(),
      forwardDisabled: startDate.toDateString() === new Date().toDateString(),
      Chart: (() => {
        if (view === "power") {
          if (range === "day") {
            return <MyBarChart data={getPowerQueryByDay.data} />;
          } else if (range === "week") {
            return <MyBarChart data={getPowerByWeekQuery.data} />;
          } else if (range === "month") {
            return <MyBarChart data={getPowerByMonthQuery.data} />;
          } else if (range === "quarter") {
            return <MyBarChart data={getPowerByYearQuery.data} />;
          } else if (range === "year") {
            return <MyBarChart data={getPowerByYearQuery.data} />;
          }
        } else if (view === "energy_delta") {
          if (range === "day") {
            return <MyBarChart data={getEnergyByDayQuery.data} />;
          } else if (range === "week") {
            return <MyBarChart data={getEnergyByWeekQuery.data} />;
          } else if (range === "month") {
            return <MyBarChart data={getEnergyByMonthQuery.data} />;
          } else if (range === "quarter") {
            return <MyBarChart data={getEnergyByWeekQuery.data} />;
          } else if (range === "year") {
            return <MyBarChart data={getEnergyByYearQuery.data} />;
          }
        } else if (view === "energy_sum") {
          if (range === "day") {
            return <MyBarChart data={getEnergyTotalByDayQuery.data} />;
          } else if (range === "week") {
            return <MyBarChart data={getEnergyTotalByWeekQuery.data} />;
          } else if (range === "month") {
            return <MyBarChart data={getEnergyTotalByMonthQuery.data} />;
          } else if (range === "quarter") {
            return <MyBarChart data={getEnergyTotalByWeekQuery.data} />;
          } else if (range === "year") {
            return <MyBarChart data={getEnergyTotalByYearQuery.data} />;
          }
        }
      })(),
    };
  })();

  return (
    <>
      <Head>
        <title>SolarSystem</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="container" className="flex flex-col w-full h-full bg-gray-200">
        <header className="flex items-center w-full h-32 gap-4 px-4 py-4 justify-evenly">
          <Card
            label="Moc teraz"
            value={getNowQuery.data?.power_now ?? 0}
            unit="W"
            currentView={view}
            setView={setView}
            view="power"
          />
          <Card
            label="Energia dziś"
            value={getNowQuery.data?.energy_today ?? 0}
            unit="kWh"
            currentView={view}
            setView={setView}
            view="energy_delta"
          />
          <Card
            label="Energia całość"
            value={getNowQuery.data?.energy_total ?? 0}
            unit="kWh"
            currentView={view}
            setView={setView}
            view="energy_sum"
          />
        </header>

        <div className="w-full pb-2 text-xl font-bold text-center">{title}</div>
        <div className="w-full pb-2 text-center font-bold text-md">
          {subtitle}
        </div>

        <main className="flex flex-col flex-1">{Chart}</main>

        <footer className="flex items-center w-full h-24 gap-4 px-4 justify-evenly">
          <FooterButton onClick={handleDateChangeBackwards}>
            {"<<"}
          </FooterButton>
          <select
            className="flex-1 h-12 text-xl font-bold text-center bg-gray-300 border-2 border-gray-700 rounded-md"
            value={range}
            onChange={handleYearChange}
          >
            <option value="day">Dzień</option>
            <option value="week">Tydzień</option>
            <option value="month">Miesiąc</option>
            <option value="quarter">Kwartał</option>
            <option value="year">Rok</option>
          </select>
          <FooterButton
            onClick={handleDateChangeForwards}
            disabled={forwardDisabled}
          >
            {">>"}
          </FooterButton>
        </footer>
      </div>
    </>
  );
};

const FooterButton: React.FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => {
  return (
    <button
      {...props}
      className={`w-16 h-12 grid place-items-center text-2xl font-bold border-2 border-blue-900 rounded-md ${
        props.disabled
          ? "bg-gray-300 text-gray-400"
          : "bg-blue-400 text-gray-700"
      }`}
    >
      {props.children}
    </button>
  );
};

const Card: React.FC<{
  label: string;
  value: number | string;
  unit: string;
  setView: React.Dispatch<React.SetStateAction<View>>;
  view: View;
  currentView: View;
}> = (props) => {
  return (
    <div
      onClick={() => props.setView(props.view)}
      className={`flex flex-col items-center justify-center flex-1 h-full border-4 ${
        props.view === props.currentView
          ? "border-green-900 bg-green-300"
          : "border-gray-700 bg-gray-300"
      } rounded-xl`}
    >
      <div className="text-sm font-bold">{`${props.value} (${props.unit})`}</div>
      <div className="text-sm">{props.label}</div>
    </div>
  );
};

export default Home;
