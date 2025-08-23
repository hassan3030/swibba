"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Mail, Phone, HelpCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslations } from "@/lib/use-translations"
import { addMessage } from "@/callAPI/users"
// import CustomerService from '../../components/customerService';
 
const containerVariantsMain = {
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
    <motion.div className="mt-20" variants={containerVariantsMain} initial="hidden" animate="visible">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
        <CustomerService/>
      </motion.div>
    </motion.div>
  )
}

export default CustomerServicePage






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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.02,
    y: -5,
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const iconVariants = {
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

const CustomerService = () => {
  const { toast } = useToast()
  const { t } = useTranslations()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone_number, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addMessageData = async () => {
    await addMessage(email, name, message, phone_number)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (name === "" || email === "" || phone_number === "" || message === "") {
      toast({
        title: "Fill Data",
        description: "Please fill your information to send",
        variant: "destructive",
      })
    } else {
      setIsSubmitting(true)
      try {
        await addMessageData()
        setName("")
        setEmail("")
        setPhoneNumber("")
        setMessage("")
        toast({
          title: t("sendMessage") || "Your message sent!",
          description: t("messageDescription") || "Your message has been sent! We'll get back to you soon.",
          variant: "primary",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  useEffect(() => {
    // Reset form fields on component mount
    setName("")
    setEmail("")
    setPhoneNumber("")
    setMessage("")
  }, [])

  return (
    <motion.div
      className="min-h-screen bg-background pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-[-2rem] mb-30">
        {/* Contact Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" variants={itemVariants}>
          <ContactCard
            icon={<MessageCircle />}
            title={t("liveChat")}
            description={t("chatDescription")}
            actionText={t("startChat")}
            onClick={() => {
              toast({
                title: t("note") || "Note",
                description: t("ifoDescription") || "Live chat feature coming soon!",
                variant: "destructive",
              })
            }}
          />
          <ContactCard
            icon={<Mail />}
            title={t("emailSupport")}
            description={t("emailDescription")}
            actionText={t("emailUs")}
            onClick={() => (window.location.href = "mailto:support@example.com")}
          />
          <ContactCard
            icon={<Phone />}
            title={t("callUs")}
            description={t("callDescription")}
            actionText={t("callNow")}
            onClick={() => {
              toast({
                title: t("note") || "Note",
                description: t("ifoTelDescription") || "Phone feature coming soon!",
                variant: "destructive",
              })
            }}
          />
        </motion.div>

        {/* Support Options Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <motion.div variants={cardVariants} whileHover="hover">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{t("faq")}</CardTitle>
                    <motion.div variants={iconVariants} whileHover="hover">
                      <Badge variant="outline" className="font-normal">
                        <HelpCircle className="h-3.5 w-3.5 mr-1" />
                        Support
                      </Badge>
                    </motion.div>
                  </div>
                  <CardDescription>{t("findAnswers")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {[
                      { value: "item-1", question: t("resetPassword"), answer: t("resetPasswordAnswer") },
                      { value: "item-2", question: t("paymentMethods"), answer: t("paymentMethodsAnswer") },
                      { value: "item-3", question: t("cancelSubscription"), answer: t("cancelSubscriptionAnswer") },
                      { value: "item-4", question: t("refundPolicy"), answer: t("refundPolicyAnswer") },
                      { value: "item-5", question: t("gettingStarted"), answer: t("gettingStartedAnswer") },
                    ].map((item, index) => (
                      <motion.div
                        key={item.value}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <AccordionItem value={item.value}>
                          <AccordionTrigger>{item.question}</AccordionTrigger>
                          <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <motion.div className="lg:col-span-1" variants={formVariants}>
            <motion.div variants={cardVariants} whileHover="hover">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{t("contactUs")}</CardTitle>
                  <CardDescription>{t("sendMessage")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="name">{t("name")}</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        id="name"
                        placeholder={t("yourName")}
                        required
                        className="transition-all duration-200 focus:scale-[1.02] hover:border-primary"
                      />
                    </motion.div>
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="email">{t("email")}</Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        id="email"
                        type="email"
                        placeholder={t("yourEmail")}
                        required
                        className="transition-all duration-200 focus:scale-[1.02] hover:border-primary"
                      />
                    </motion.div>
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="phone_number">{t("phoneNumber")}</Label>
                      <Input
                        value={phone_number}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        id="phone_number"
                        placeholder={t("phoneNumberPlaceholder")}
                        required
                        className="transition-all duration-200 focus:scale-[1.02] hover:border-primary"
                      />
                    </motion.div>
                    <motion.div className="space-y-2" variants={itemVariants}>
                      <Label htmlFor="message">{t("message")}</Label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full min-h-[120px] hover:border-primary rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 focus:scale-[1.02]"
                        placeholder={t("messagePlaceholder")}
                        required
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.1 }}
                      >
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                          <AnimatePresence mode="wait">
                            {isSubmitting ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-2"
                              >
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Sending...
                              </motion.div>
                            ) : (
                              <motion.span
                                key="send"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {t("sendMessageBtn")}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Support Categories */}
        <motion.div className="mb-12" variants={itemVariants}>
          <motion.h2 className="text-2xl font-bold mb-6" variants={itemVariants}>
            {t("browseTopics")}
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={containerVariants}
          >
            {[
              { title: t("accountBilling"), count: 1 },
              { title: t("productFeatures"), count: 1 },
              { title: t("technicalIssues"), count: 1 },
              { title: t("ordersShipping"), count: 1 },
              { title: t("returnsRefunds"), count: 1 },
              { title: t("privacySecurity"), count: 1 },
            ].map((topic, index) => (
              <motion.div key={topic.title} variants={itemVariants} custom={index}>
                <TopicCard title={topic.title} count={topic.count} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Supporting component for contact cards
const ContactCard = ({ icon, title, description, actionText, onClick }) => {
  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className="transition-all hover:shadow-md h-full">
        <CardContent className="pt-6">
          <motion.div
            className="rounded-full bg-primary/90 text-muted p-3 w-12 h-12 flex items-center justify-center mb-4"
            variants={iconVariants}
            whileHover="hover"
          >
            <div className="text-primary-foreground ">{icon}</div>
          </motion.div>
          <h3 className="text-xl font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{description}</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={onClick} variant="outline" className="w-full">
              {actionText}
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Supporting component for topic cards
const TopicCard = ({ title, count }) => {
  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className="transition-all hover:shadow-md cursor-pointer hover:bg-secondary/5">
        <CardContent className="flex justify-between items-center p-4">
          <h3 className="font-medium">{title}</h3>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Badge variant="secondary" className="ml-2">
              {count}
            </Badge>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

