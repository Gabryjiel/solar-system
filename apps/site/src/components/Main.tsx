export const Main: React.FC<{ children?: React.ReactNode }> = (props) => {
  return (
    <main className="w-full portrait:h-5/6 landscape:h-3/6">
      {props.children}
    </main>
  );
};
