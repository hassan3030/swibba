"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export default function SecurityTab({
  currentEmail,
  setCurrentEmail,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  updatePassword,
  t,
  isRTL,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex items-center gap-3">
            
            <div className={isRTL ? 'text-right w-full' : ''}>
              <CardTitle className={`text-2xl font-bold text-foreground ${isRTL ? 'force-rtl' : ''}`}>
                {t("security") || "Security"}
              </CardTitle>
              <CardDescription className={`text-base mt-1 text-muted-foreground ${isRTL ? 'force-rtl' : ''}`}>
                {t("Manageyouraccountsecurityprivacy") || "Manage your account security and privacy settings"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <h3 className={`font-semibold text-lg mb-4 ${isRTL ? 'force-rtl' : ''}`}>
                {t("ChangePassword") || "Change Password"}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email" className={`text-sm font-medium ${isRTL ? 'force-rtl' : ''}`}>
                    {t("CurrentEmail") || "Current Email"}
                  </Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className={`text-sm font-medium ${isRTL ? 'force-rtl' : ''}`}>
                    {t("NewPassword") || "New Password"}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className={`text-sm font-medium ${isRTL ? 'force-rtl' : ''}`}>
                    {t("ConfirmPassword") || "Confirm New Password"}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    onClick={updatePassword}
                    className="w-full sm:w-auto px-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
                  >
                    {t("UpdatePassword") || "Update Password"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
