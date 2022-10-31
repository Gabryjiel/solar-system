import Link from "next/link";

type Tabs = "general" | "power" | "energy_delta" | "energy_total";

export const BottomNavigation: React.FC<{ active: Tabs }> = (props) => {
  return (
    <nav>
      <div className="flex justify-between border-t-4 border-blue-900">
        <BottomNavigationItem
          tabName="general"
          activeTab={props.active}
          text="Nowe"
          href="/"
        />
        <BottomNavigationItem
          tabName="power"
          activeTab={props.active}
          text="Moc"
          href="/power"
        />
        <BottomNavigationItem
          tabName="energy_delta"
          activeTab={props.active}
          text="Przyrost"
          href="/delta"
        />
        <BottomNavigationItem
          tabName="energy_total"
          activeTab={props.active}
          text="Energia"
          href="/total"
        />
      </div>
    </nav>
  );
};

const BottomNavigationItem: React.FC<{
  text: string;
  href: string;
  tabName: Tabs;
  activeTab: Tabs;
}> = (props) => {
  const activeTabClasses =
    props.tabName === props.activeTab ? "bg-green-200" : "bg-blue-200";

  return (
    <Link href={props.href}>
      <div
        className={`grid flex-1 h-full  place-items-center ${activeTabClasses}`}
      >
        <span>+</span>
        <span>{props.text}</span>
      </div>
    </Link>
  );
};
