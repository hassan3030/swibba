"use client"
import { motion } from "framer-motion"
// import CustomerService from '../../components/customerService';
 
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

const CustomerServicePage = () => {
  return (
    <motion.div className="mt-20" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* <CustomerService/> */}
      </motion.div>
    </motion.div>
  )
}

export default CustomerServicePage
