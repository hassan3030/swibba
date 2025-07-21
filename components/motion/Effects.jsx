import { motion } from "framer-motion";

export default function HoverButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.1, backgroundColor: "#0070f3", color: "#fff" }}
      transition={{ type: "spring", stiffness: 300 }}
      style={{
        padding: "1rem 2rem",
        fontSize: "1.2rem",
        border: "none",
        borderRadius: "8px",
        background: "#eee",
        cursor: "pointer"
      }}
    >
      Hover Me!
    </motion.button>
  );
}