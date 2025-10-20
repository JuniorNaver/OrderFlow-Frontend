import { motion, AnimatePresence } from "framer-motion";

const Toast = ({ message, type = "success" }) => {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="toast"
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed bottom-6 inset-x-0 mx-auto w-max
          inline-flex items-center justify-center
          px-4 py-2.5 text-white text-sm font-medium text-center
          rounded-full shadow-lg z-[9999]
          ${colors[type]} backdrop-blur-md bg-opacity-90
          max-w-[85%] min-w-[160px]
        `}
        style={{ pointerEvents: "none" }}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;