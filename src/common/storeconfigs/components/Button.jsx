// src/common/storeconfigs/components

const Button = ({ color, icon, children, ...props }) => {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-300 hover:bg-gray-400 text-gray-700",
  };
  return (
    <button
      {...props}
      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-sm font-medium transition ${colors[color]}`}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;