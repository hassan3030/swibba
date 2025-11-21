"use client"
import { motion } from "framer-motion"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Upload, X, Image as ImageIcon } from "lucide-react"
import { inputVariants, containerVariants } from "./edit-profile-animations"
import FlagIcon from "@/components/general/flag-icon"
import { countriesListWithFlags } from "@/lib/countries-data"
import PhoneInputWithVerify from "./phone-input-with-verify"

export default function ProfileFormFields({
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
  handlePhoneChange,
  phoneValidationError,
  verified,
  setShowPhoneVerification,
  avatar,
  setAvatar,
  shouldRemoveAvatar,
  setShouldRemoveAvatar,
  avatarPath,
  gender,
  setGender,
  country_code,
  onCountryCodeChange,
  isRTL,
  t,
}) {
  const [avatarPreview, setAvatarPreview] = useState(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setShouldRemoveAvatar(false)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearAvatar = (e) => {
    if (e) e.preventDefault()
    setAvatar(null)
    setAvatarPreview(null)
    setShouldRemoveAvatar(true)
  }

  // Check if there's a real avatar (not placeholder or empty)
  const hasRealAvatar = avatarPreview || (!shouldRemoveAvatar && avatarPath && 
    avatarPath !== "/placeholder-user.jpg" && 
    !avatarPath.includes("placeholder-user") && 
    !avatarPath.endsWith("undefined") &&
    !avatarPath.endsWith("null"))

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="first_name" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("firstName")}
          </Label>
          <motion.div whileFocus="focus">
            <Input
              id="first_name"
              name="first_name"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </motion.div>
        </motion.div>

        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="last_name" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("LastName") || "Last Name"}
          </Label>
          <motion.div whileFocus="focus">
            <Input
              id="last_name"
              name="last_name"
              value={last_name}
              onChange={(e) => setLasttName(e.target.value)}
              className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Location Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Country field */}
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="country" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Country") || "Country"}
          </Label>
          <motion.div whileFocus="focus">
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="hover:bg-primary/20">
                <SelectValue placeholder={t("SelectCountry") || "Select country"}>
                  {country && (
                    <div className="flex items-center gap-2">
                      <FlagIcon
                        flag={countriesListWithFlags.find(c => c.name === country)?.flag}
                        countryCode={country}
                        className="text-lg"
                      />
                      <span>{t(country) || country}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="h-40 no-scroll-arrows">
                <div className="flex items-center gap-2 px-3 py-2 sticky top-0 bg-background border-b">
                  <Search className="h-4 w-4 opacity-50" />
                  <input
                    className="flex h-8 w-full rounded-md bg-background top-0 px-3 py-1 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder={t("Search country...")}
                    onChange={(e) => {
                      const searchField = e.target;
                      const value = searchField.value.toLowerCase();
                      const items = searchField.closest('.select-content')?.querySelectorAll('.select-item') || [];
                      
                      items.forEach(item => {
                        const countryName = item.textContent.toLowerCase();
                        const translatedName = t(item.getAttribute('data-value'))?.toLowerCase() || '';
                        const shouldShow = countryName.includes(value) || translatedName.includes(value);
                        item.style.display = shouldShow ? '' : 'none';
                      });
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
                <div className="overflow-y-auto max-h-[calc(10rem-40px)]">
                  {countriesListWithFlags.map((c) => (
                    <SelectItem key={c.name} value={c.name} className="text-right hover:!bg-primary/20 select-item" data-value={c.name}>
                      <div className="flex items-center gap-2">
                        <FlagIcon flag={c.flag} countryCode={c.name} className="text-lg" />
                        <span>{t(c.name) || c.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>

        {/* City field */}
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="city" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("City") || "City"}
          </Label>
          <motion.div whileFocus="focus">
            <Input
              id="city"
              name="city"
              value={editedTranslations[currentLangCode].city}
              onChange={(e) => {
                const { value } = e.target;
                setEditedTranslations(prev => ({
                  ...prev,
                  [currentLangCode]: { ...prev[currentLangCode], city: value }
                }));
              }}
              className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
              dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
            />
          </motion.div>
        </motion.div>

        {/* Street field */}
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="street" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Street") || "Street"}
          </Label>
          <motion.div whileFocus="focus">
            <Input
              id="street"
              name="street"
              value={editedTranslations[currentLangCode].street}
              onChange={(e) => {
                const { value } = e.target;
                setEditedTranslations(prev => ({
                  ...prev,
                  [currentLangCode]: { ...prev[currentLangCode], street: value }
                }));
              }}
              className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
              dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
            />
          </motion.div>
        </motion.div>

        {/* Postal Code field */}
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="post_code" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Postalcode") || "Postal Code"}
          </Label>
          <motion.div whileFocus="focus">
            <Input
              id="post_code"
              name="post_code"
              value={post_code}
              onChange={(e) => setPostCode(e.target.value)}
              className="transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent text-left rtl:text-right"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Contact and Personal Info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="email" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("email") || "Email"}
          </Label>
          <Input
            disabled
            id="email"
            name="email"
            type="email"
            value={email || ""}
            className="bg-background border border-border/50 cursor-not-allowed"
          />
        </motion.div>

        <motion.div className="space-y-2" variants={inputVariants}>
          <PhoneInputWithVerify
            value={phone_number}
            onChange={handlePhoneChange}
            isVerified={verified}
            onVerifyClick={() => setShowPhoneVerification(true)}
            error={phoneValidationError}
            countryCode={country_code || "+20"}
            onCountryCodeChange={onCountryCodeChange}
            isRTL={isRTL}
          />
        </motion.div>
      </div>

      {/* Avatar Upload and Gender */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rtl:grid-flow-col-dense">
        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="avatar" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Avatar") || "Profile Picture"}
          </Label>
          
          {/* Single Field with Image Preview and Buttons */}
          <div className="flex items-center gap-3 h-10 px-3 rounded-md border border-border bg-background">
            {hasRealAvatar ? (
              <>
                {/* Small Avatar Preview */}
                <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={avatarPreview || (shouldRemoveAvatar || !avatarPath || avatarPath.includes("placeholder") || avatarPath.includes("undefined") || avatarPath.includes("null") ? "/placeholder-user.jpg" : avatarPath)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-user.jpg"
                    }}
                  />
                </div>
                
                {/* Update and Remove Buttons */}
                <div className="flex-1 flex items-center gap-2">
                  <input
                    id="avatar-update"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-update"
                    className="cursor-pointer flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span className="font-medium">{t("update") || "Update"}</span>
                  </label>
                  
                  <span className="text-muted-foreground">|</span>
                  
                  <button
                    type="button"
                    onClick={clearAvatar}
                    className="flex items-center gap-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="font-medium">{t("remove") || "Remove"}</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Upload Input */}
                <input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <label
                  htmlFor="avatar"
                  className="cursor-pointer flex items-center gap-2 flex-1"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {t("ClickToUpload") || "Upload image"}
                  </span>
                </label>
              </>
            )}
          </div>
        </motion.div>

        <motion.div className="space-y-2" variants={inputVariants}>
          <Label htmlFor="gender" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
            {t("Gender") || "Gender"}
          </Label>
          <Select value={gender} onValueChange={(value) => setGender(value)}>
            <SelectTrigger className="transition-all hover:bg-primary/20 duration-300 focus:ring-2 focus:ring-ring focus:border-transparent">
              <SelectValue placeholder={t("SelectGender") || "Select Gender"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male" className="hover:!bg-primary/20">{t("Male") || "Male"}</SelectItem>
              <SelectItem value="female" className="hover:!bg-primary/20">{t("Female") || "Female"}</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div className="space-y-2" variants={inputVariants}>
        <Label htmlFor="description" className={`text-sm font-medium text-foreground ${isRTL ? 'force-rtl' : ''}`}>
          {t("descriptionProfile") || "Description"}
        </Label>
        <motion.div whileFocus="focus">
          <Textarea
            id="description"
            name="description"
            value={editedTranslations[currentLangCode].description}
            onChange={(e) => {
              const { value } = e.target;
              setEditedTranslations(prev => ({
                ...prev,
                [currentLangCode]: { ...prev[currentLangCode], description: value }
              }));
            }}
            rows={4}
            className={`transition-all duration-300 focus:ring-2 focus:ring-ring focus:border-transparent resize-none text-left ${isRTL ? 'force-rtl' : ''}`}
            dir={currentLangCode === 'ar-SA' ? 'rtl' : 'ltr'}
            placeholder={currentLangCode === 'ar-SA'
              ? "أخبر الآخرين عن نفسك..."
              : "Tell others about yourself..."
            }
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
