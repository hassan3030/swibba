"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

const socialVariants = {
  hover: {
    scale: 1.2,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const linkVariants = {
  hover: {
    x: 5,
    color: "hsl(var(--primary))",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

export function Footer() {
  const { isRTL } = useLanguage()
  const { t } = useTranslations()

  return (
    <motion.footer
      className="border-t bg-background my-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container pt-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants}>
            <motion.h3
              className="mb-4 text-lg font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              DeelDeal
            </motion.h3>
            <motion.div className="mb-4 flex gap-4" variants={containerVariants} initial="hidden" animate="visible">
              {[
                { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61579242208574", label: "Facebook" },
                { icon: Twitter, href: "https://x.com/DEELDEAL", label: "Twitter" },
                { icon: Instagram, href: "https://www.instagram.com/deeldeal123/", label: "Instagram" },
              ].map((social, index) => (
                <motion.div key={social.label} variants={itemVariants} custom={index}>
                  <Link
                    href={social.href}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <motion.div variants={socialVariants} whileHover="hover">
                      <social.icon className="h-4 w-4" />
                      <span className="sr-only">{social.label}</span>
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-lg font-semibold">{t("categories")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/categories/electronics", label: t("electronics") },
                { href: "/categories/fashion", label: t("fashion") },
                { href: "/categories/home", label: t("home") },
                { href: "/categories/beauty", label: t("beauty") },
              ].map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <motion.div variants={linkVariants} whileHover="hover">
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="mb-4 text-lg font-semibold">{t("contactUs")}</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/customerService", label: t("customerService") },
                { href: "/about", label: t("aboutUs") },
              ].map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <motion.div variants={linkVariants} whileHover="hover">
                    <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-10 border-t pt-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              &copy; {new Date().getFullYear()} DeelDeal. {t("allRightsReserved")}
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  )
}
