interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 ${className}`}>
      {children}
    </button>
  );
};

export default Button;
