"use client"
import { motion } from "framer-motion"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Globe, Shield, CirclePlus } from "lucide-react"
import { cardVariants } from "./edit-profile-animations"

export default function ProfileSidebar({ t, isRTL, getDirectionValue, handleKYC }) {
  const tabs = [
    { value: "profile", icon: User, label: t("profile") },
    { value: "preferences", icon: Globe, label: t("preferences") },
    { value: "security", icon: Shield, label: t("security") }
  ]

  return (
    <motion.div className={`w-full lg:col-span-1 order-1 ${isRTL ? 'lg:order-2' : 'lg:order-1'}`}>
      <motion.h1
        className={`mx-2 text-2xl font-bold inline text-primary/90 mb-2 ${isRTL ? 'force-rtl' : ''}`}
        initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {t("accountSettings")}
      </motion.h1>
      <motion.div variants={cardVariants} whileHover="hover" className="sticky top-8">
        <TabsList className="flex h-auto w-full flex-col items-start rtl:items-end justify-start shadow-lg border border-border/50 p-2 rounded-xl bg-background">
          {tabs.map((tab, index) => (
            <motion.div
              key={tab.value}
              initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full hover:bg-primary/20 rounded-md mt-1"
            >
              <TabsTrigger
                value={tab.value}
                className="w-full justify-start rtl:justify-end text-left rtl:text-right data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg border border-transparent data-[state=active]:border-primary/30"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
                >
                  <tab.icon className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
                </motion.div>
                <span className="px-1">{tab.label}</span>
              </TabsTrigger>
            </motion.div>
          ))}

          <span
            initial={{ opacity: 0, x: getDirectionValue(-20, 20) }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + 4 * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-md mt-1"
            onClick={() => { handleKYC() }}
          >
            <TabsTrigger
              value={'add'}
              className="w-full justify-start rtl:justify-end text-left rtl:text-right data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 4 }}
              >
              </motion.div>
              <CirclePlus className="mr-2 rtl:ml-2 rtl:mr-0 h-4 w-4" />
              <span className="px-1">{t("addItem")}</span>
            </TabsTrigger>
          </span>
        </TabsList>
      </motion.div>
    </motion.div>
  )
}
