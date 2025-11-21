"use client"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, Phone, Upload, User, X, Camera, Trash2 } from "lucide-react"
import ProfileFormFields from "./profile-form-fields"
import LocationSection from "./location-section"
import { mediaURL } from "@/callAPI/utiles"

export default function ProfileTab({
  user,
  avatarPath,
  first_name,
  setFirstName,
  last_name,
  setLasttName,
  country,
  setCountry,
  editedTranslations,
  setEditedTranslations,
  currentLangCode,
  post_code,
  setPostCode,
  email,
  phone_number,
  country_code,
  handlePhoneChange,
  onCountryCodeChange,
  phoneValidationError,
  verified,
  setShowPhoneVerification,
  avatar,
  setAvatar,
  shouldRemoveAvatar,
  setShouldRemoveAvatar,
  gender,
  setGender,
  isGettingLocation,
  getCurrentPosition,
  selectedPosition,
  geo_location,
  handleLocationSelect,
  handleSubmit,
  isLoading,
  isAiProcessing,
  activeTab,
  t,
  isRTL,
  getDirectionClass,
  getDirectionValue,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-border/50 bg-card shadow-sm">
        <CardHeader className="border-b border-border/50 pb-6">
          <div className="flex items-start justify-between">
            <div className={isRTL ? 'text-right w-full' : ''}>
              <CardTitle className={`text-2xl font-bold text-foreground ${isRTL ? 'force-rtl' : ''}`}>
                {t("profileInformation") || "Profile Information"}
              </CardTitle>
              <CardDescription className={`text-base mt-2 text-muted-foreground ${isRTL ? 'force-rtl' : ''}`}>
                {t("updateProfileInformation") || "Update your profile information and avatar"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <form className="space-y-8">
            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-muted/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Avatar with hover overlay */}
                    <div className="relative group flex-shrink-0">
                      <div className="w-24 h-24 rounded-full border-4 border-primary/20 shadow-lg bg-muted relative">
                        <img
                          src={
                            avatar 
                              ? URL.createObjectURL(avatar)
                              : (shouldRemoveAvatar || !avatarPath || avatarPath === "/placeholder-user.jpg" || avatarPath.includes("placeholder") || avatarPath.includes("undefined") || avatarPath.includes("null"))
                                ? "/placeholder-user.jpg"
                                : avatarPath
                          }
                          alt={`${first_name} ${last_name}`}
                          className="w-full h-full object-cover rounded-full"
                          onError={(e) => {
                            e.target.src = "/placeholder-user.jpg"
                          }}
                        />
                        {/* Hover Overlay - Circular */}
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          {/* Camera Icon - Center */}
                          <input
                            id="avatar-card-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0]
                              if (file) {
                                setAvatar(file)
                                setShouldRemoveAvatar(false)
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="avatar-card-upload"
                            className="cursor-pointer w-12 h-12 rounded-full bg-primary/90 hover:bg-primary flex items-center justify-center transition-all shadow-lg"
                            title="Update avatar"
                          >
                            <Camera className="h-6 w-6 text-white" />
                          </label>
                        </div>
                        
                        {/* X Icon - Top Right - Only show if there's a real avatar */}
                        {(avatar || (!shouldRemoveAvatar && avatarPath && avatarPath !== "/placeholder-user.jpg" && !avatarPath.includes("placeholder") && !avatarPath.includes("undefined") && !avatarPath.includes("null"))) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setAvatar(null)
                              setShouldRemoveAvatar(true)
                              const fileInput = document.getElementById('avatar-card-upload')
                              if (fileInput) fileInput.value = ''
                            }}
                            className="absolute top-0 right-0 w-6 h-6 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100 z-20"
                            title="Remove avatar"
                          >
                            <X className="h-3.5 w-3.5 text-white" />
                          </button>
                        )}
                      </div>
                      {verified === 'true' && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-card flex items-center justify-center z-10">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xl font-bold text-foreground mb-3 ${isRTL ? 'force-rtl' : ''}`}>
                        {first_name && last_name ? `${first_name} ${last_name}` : user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : t("userName") || "User Name"}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm truncate">{email || user?.email || t("noEmail") || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">{phone_number || user?.phone_number || t("noPhone") || "No phone"}</span>
                          {verified === 'true' && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/10 text-green-600 dark:text-green-400 rounded-full font-medium">
                              {t("verified") || "Verified"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Form Fields */}
            <div className="space-y-6">
              <ProfileFormFields
                first_name={first_name}
                setFirstName={setFirstName}
                last_name={last_name}
                setLasttName={setLasttName}
                country={country}
                setCountry={setCountry}
                editedTranslations={editedTranslations}
                setEditedTranslations={setEditedTranslations}
                currentLangCode={currentLangCode}
                post_code={post_code}
                setPostCode={setPostCode}
                email={email}
                phone_number={phone_number}
                country_code={country_code}
                handlePhoneChange={handlePhoneChange}
                onCountryCodeChange={onCountryCodeChange}
                phoneValidationError={phoneValidationError}
                verified={verified}
                setShowPhoneVerification={setShowPhoneVerification}
                avatar={avatar}
                setAvatar={setAvatar}
                shouldRemoveAvatar={shouldRemoveAvatar}
                setShouldRemoveAvatar={setShouldRemoveAvatar}
                avatarPath={avatarPath}
                gender={gender}
                setGender={setGender}
                isRTL={isRTL}
                t={t}
              />
            </div>

            {/* Location Section */}
            <div className="pt-4">
              <LocationSection
                isGettingLocation={isGettingLocation}
                getCurrentPosition={getCurrentPosition}
                selectedPosition={selectedPosition}
                geo_location={geo_location}
                handleLocationSelect={handleLocationSelect}
                activeTab={activeTab}
                t={t}
                isRTL={isRTL}
                getDirectionClass={getDirectionClass}
                getDirectionValue={getDirectionValue}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-border/50 bg-muted/30 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-6"
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button
            onClick={(e) => { handleSubmit(e) }}
            disabled={isLoading || isAiProcessing}
            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isLoading || isAiProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-4 w-4" />
                {isAiProcessing
                  ? (t("saving") || "Saving...")
                  : (t("saving") || "Saving...")
                }
              </span>
            ) : (
              <span>{t("save") || "Save Changes"}</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
