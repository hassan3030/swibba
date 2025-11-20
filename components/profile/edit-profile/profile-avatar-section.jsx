"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { Camera } from "lucide-react"
import { avatarVariants } from "./edit-profile-animations"
import { mediaURL } from "@/callAPI/utiles"

export default function ProfileAvatarSection({ user, avatarPath, t }) {
  return (
    <motion.div
      className="mb-8 flex flex-col items-center space-y-4"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div
        className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-primary/20 shadow-xl"
        variants={avatarVariants}
        whileHover="hover"
      >
        {avatarPath && user?.avatar ? (
          <Image
            src={avatarPath}
            alt={`${(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10))) || t("account")}`}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full bg-background border border-border/50">
            <Image
              src="/placeholder-user.jpg"
              alt={t("noAvatar")}
              width={96}
              height={96}
              className="h-full w-full object-cover absolute inset-0"
            />
            <span className="absolute inset-0 flex items-center justify-center text-foreground/70 font-semibold">
              {`${(String(user?.first_name).length <= 11 ? (String(user?.first_name)) : (String(user?.first_name).slice(0, 10))) || t("noAvatar")}`}
            </span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 bg-foreground/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          whileHover={{ opacity: 1 }}
        >
          <Camera className="h-6 w-6 text-background" />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
