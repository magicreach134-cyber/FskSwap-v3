interface SelectProps {
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = ({ options, value, onChange }: SelectProps) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-gray-100"
    >
      {options.map((opt, idx) => (
        <option key={idx} value={opt}>{opt}</option>
      ))}
    </select>
  );
};

export default Select;
