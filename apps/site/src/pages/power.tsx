import { addDays, addMonths, addYears, lightFormat } from "date-fns";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import React, { useState } from "react";

import { BottomNavigation } from "../components/BottomNavigation";
import { Main } from "../components/Main";
import { Select } from "../components/Select";
import { Range } from "../utils/enums";
import { trpc } from "../utils/trpc";

const MyBarChart = dynamic(
  () => import("../components/charts/MyBarChart").then((imp) => imp.MyBarChart),
  { ssr: false }
);

const RangeOptions = [
  { key: "range-options-hour", label: "Godzina", value: Range.HOUR },
  { key: "range-options-day", label: "Dzień", value: Range.DAY },
  { key: "range-options-week", label: "Tydzień", value: Range.WEEK },
  { key: "range-options-month", label: "Miesiąc", value: Range.MONTH },
  { key: "range-options-quarter", label: "Kwartał", value: Range.QUARTER },
  { key: "range-options-year", label: "Rok", value: Range.YEAR },
];

const Title = {
  [Range.HOUR]: "Średnia moc względem godziny",
  [Range.DAY]: "Średnia moc względem dnia",
  [Range.WEEK]: "Średnia moc względem tygodnia",
  [Range.MONTH]: "Średnia moc względem miesiąca",
  [Range.QUARTER]: "Średnia moc względem kwartału",
  [Range.YEAR]: "Średnia moc względem roku",
};

const Subtitle = {
  [Range.HOUR]: (date: Date) => date.toLocaleDateString(),
  [Range.DAY]: (date: Date) => lightFormat(date, "yyyy-MM"),
  [Range.WEEK]: (date: Date) => lightFormat(date, "yyyy-MM"),
  [Range.MONTH]: (date: Date) => date.getFullYear(),
  [Range.QUARTER]: (date: Date) => date.getFullYear(),
  [Range.YEAR]: (date: Date) => date.toLocaleDateString(),
};

const Page: NextPage = () => {
  const [range, setRange] = useState<Range>(Range.HOUR);
  const [startDate, setStartDate] = useState(new Date());

  const byHourQuery = trpc.power.byHour.useQuery(
    { startDate },
    {
      enabled: range === Range.HOUR,
      keepPreviousData: true,
    }
  );

  const byDayQuery = trpc.power.byDay.useQuery(
    { startDate },
    {
      enabled: range === Range.DAY,
      keepPreviousData: true,
    }
  );

  const byWeekQuery = trpc.power.byWeek.useQuery(
    { startDate },
    {
      enabled: range === Range.WEEK,
      keepPreviousData: true,
    }
  );

  const byMonthQuery = trpc.power.byMonth.useQuery(
    { startDate },
    {
      enabled: range === Range.MONTH,
      keepPreviousData: true,
    }
  );

  const byQuarterQuery = trpc.power.byQuarter.useQuery(
    { startDate },
    {
      enabled: range === Range.QUARTER,
      keepPreviousData: true,
    }
  );

  const byYearQuery = trpc.power.byYear.useQuery(undefined, {
    enabled: range === Range.YEAR,
    keepPreviousData: true,
  });

  const handleRangeChange: React.ChangeEventHandler<HTMLSelectElement> = (
    event
  ) => {
    const { value } = event.target;

    if (value in Range) {
      setRange(value as Range);
    }
  };

  const handleDateChangeBackwards = () => {
    if (range === Range.HOUR) {
      setStartDate((prev) => addDays(prev, -1));
    } else if (range === Range.DAY || range === Range.WEEK) {
      setStartDate((prev) => addMonths(prev, -1));
    } else if (range === Range.MONTH || Range.QUARTER) {
      setStartDate((prev) => addYears(prev, -1));
    }
  };

  const handleDateChangeForwards = () => {
    if (range === Range.HOUR) {
      setStartDate((prev) => addDays(prev, 1));
    } else if (range === Range.DAY || range === Range.WEEK) {
      setStartDate((prev) => addMonths(prev, 1));
    } else if (range === Range.MONTH || range === Range.QUARTER) {
      setStartDate((prev) => addYears(prev, 1));
    }
  };

  const title = Title[range];
  const subtitle = Subtitle[range](startDate);
  const backwardDisabled = range === Range.YEAR;
  const forwardDisabled =
    startDate.toDateString() === new Date().toDateString() ||
    range === Range.YEAR;

  const chartData = (() => {
    if (range === Range.HOUR) {
      return byHourQuery.data;
    } else if (range === Range.DAY) {
      return byDayQuery.data;
    } else if (range === Range.WEEK) {
      return byWeekQuery.data;
    } else if (range === Range.MONTH) {
      return byMonthQuery.data;
    } else if (range === Range.QUARTER) {
      return byQuarterQuery.data;
    } else if (range === Range.YEAR) {
      return byYearQuery.data;
    } else {
      return [];
    }
  })();

  const drillDown = (value: string) => {
    if (range === Range.DAY) {
      const [day, month] = value.split(".");

      if (day && month) {
        setRange(Range.HOUR);
        setStartDate(
          (prev) => new Date(`${prev.getFullYear()}-${month}-${day}`)
        );
      }
    } else if (range === Range.YEAR) {
      if (/\d{4}/.test(value)) {
        setRange(Range.MONTH);
      }
    } else if (range === Range.MONTH) {
      if (/\d{2}/.test(value)) {
        setRange(Range.DAY);
        setStartDate((prev) => new Date(`${prev.getFullYear()}-${value}-01`));
      }
    } else if (range === Range.QUARTER) {
      if (/\d{1}/.test(value)) {
        setRange(Range.MONTH);
      }
    }
  };

  const isLoading =
    byHourQuery.isFetching ||
    byDayQuery.isFetching ||
    byWeekQuery.isFetching ||
    byMonthQuery.isFetching ||
    byQuarterQuery.isFetching ||
    byYearQuery.isFetching;

  return (
    <>
      <Head>
        <title>SolarSystem - Strona główna</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="container" className="flex flex-col w-full h-full bg-gray-200">
        <header className="w-full h-16">
          <div className="w-full pb-2 text-xl font-bold text-center">
            {title}
          </div>
          <div className="w-full pb-2 font-bold text-center text-md">
            {subtitle}
          </div>
        </header>

        <Main>
          {isLoading ? (
            <span>Ładowanie</span>
          ) : (
            <MyBarChart data={chartData} drillDown={drillDown} />
          )}
        </Main>

        <footer className="flex items-center w-full h-16 gap-4 px-4 justify-evenly">
          <FooterButton
            onClick={handleDateChangeBackwards}
            disabled={backwardDisabled}
          >
            {"<<"}
          </FooterButton>
          <Select
            onChange={handleRangeChange}
            value={range}
            options={RangeOptions}
          />
          <FooterButton
            onClick={handleDateChangeForwards}
            disabled={forwardDisabled}
          >
            {">>"}
          </FooterButton>
        </footer>

        <BottomNavigation active="power" />
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

export default Page;
