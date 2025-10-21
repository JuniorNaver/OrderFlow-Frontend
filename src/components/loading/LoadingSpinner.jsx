// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "로딩 중입니다..." }) {
  const colors = ["bg-red-500", "bg-blue-500", "bg-green-500"];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      <div className="flex gap-4">
        {colors.map((color, i) => (
          <motion.span
            key={i}
            className={`w-8 h-8 rounded-full ${color}`}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      <p className="text-white text-lg font-medium mt-6 animate-pulse">{message}</p>
    </div>
  );
}
