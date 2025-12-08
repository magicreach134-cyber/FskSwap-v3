interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div className={`p-4 rounded shadow bg-white dark:bg-gray-800 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
