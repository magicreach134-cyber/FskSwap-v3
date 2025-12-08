interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

const Input = ({ placeholder, value, onChange, type = "text" }: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-gray-100"
    />
  );
};

export default Input;
