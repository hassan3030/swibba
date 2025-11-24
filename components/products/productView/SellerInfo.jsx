"use client"
import { motion } from "framer-motion"
import { Star, BadgeCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

export function SellerInfo({ user, name, avatar, rate, completedOffersCount, t }) {
  const router = useRouter()
  
  const handleClick = () => {
    if (user?.id) {
      router.push(`/user-profile/${user.id}`)
    }
  }
  
  // Calculate filled stars based on rate
  const fullStars = Math.floor(rate || 0)
  const hasHalfStar = (rate || 0) % 1 >= 0.5
  
  return (
    <motion.div
      variants={fadeInUp}
      onClick={handleClick}
      className="bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-4 border hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
            <AvatarImage src={avatar || "/placeholder.svg"} alt={name || "User"} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {name ? name.charAt(0) : "U"}
            </AvatarFallback>
          </Avatar>
          {(user?.Verified === "true" || user?.Verified === true) && (
            <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
              <BadgeCheck className="h-4 w-4 text-primary fill-primary" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-base text-foreground truncate mb-1">
            {name || "Unknown"}
          </h4>
          
          <div className="flex items-center gap-2">
            {/* Star Rating */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3.5 w-3.5 ${
                    star <= fullStars
                      ? "fill-secondary2 text-secondary2"
                      : star === fullStars + 1 && hasHalfStar
                      ? "fill-secondary2/50 text-secondary2"
                      : "fill-none text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            
            {/* Swaps Badge */}
            <Badge variant="secondary" className="text-xs px-2 py-0.5">
              {completedOffersCount > 1000 
                ? "1000+"
                : completedOffersCount || 0} {t("swaps") || "swaps"}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
