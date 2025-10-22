"use client"

import { motion } from "framer-motion"

const buttonVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

const activeButtonVariants = {
  initial: {
    backgroundColor: "rgb(59, 130, 246)",
    color: "white",
    scale: 1,
  },
  hover: {
    backgroundColor: "rgb(37, 99, 235)",
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
}

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <motion.nav
      className="flex justify-center mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <motion.button
            className="px-3 py-1 rounded-l border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variants={buttonVariants}
            whileHover={currentPage === 1 ? {} : "hover"}
            whileTap={currentPage === 1 ? {} : "tap"}
          >
            Prev
          </motion.button>
        </li>
        {pages.map((page) => (
          <li key={page}>
            <motion.button
              className={`px-3 py-1 border border-gray-300 ${
                currentPage === page ? "bg-primary text-white" : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => onPageChange(page)}
              variants={currentPage === page ? activeButtonVariants : buttonVariants}
              initial={currentPage === page ? "initial" : ""}
              whileHover="hover"
              whileTap="tap"
            >
              {page}
            </motion.button>
          </li>
        ))}
        <li>
          <motion.button
            className="px-3 py-1 rounded-r border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variants={buttonVariants}
            whileHover={currentPage === totalPages ? {} : "hover"}
            whileTap={currentPage === totalPages ? {} : "tap"}
          >
            Next
          </motion.button>
        </li>
      </ul>
    </motion.nav>
  )
}

export default Pagination
