export const Select: React.FC<{
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  value: string;
  options: {
    key: string;
    value: string;
    label: string;
  }[];
}> = (props) => {
  return (
    <select
      className="flex-1 h-12 text-xl font-bold text-center bg-gray-300 border-2 border-gray-700 rounded-md"
      value={props.value}
      onChange={props.onChange}
    >
      {props.options.map((option) => {
        return (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
};
