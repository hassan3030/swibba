"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Wallet, 
  ArrowLeft, 
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Banknote,
  PiggyBank,
  TrendingUp,
  Download,
  Upload,
  Lock,
  Smartphone,
  Building2,
  Globe,
  Shield,
  Loader2,
  Star
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "@/lib/use-translations"
import { decodedToken, getCookie } from "@/callAPI/utiles"
import { getUserById } from "@/callAPI/users"
import { 
  addCashBalance, 
  getCurrentBalance, 
  withdrawCash, 
  addPaymentMethod, 
  getPaymentMethods, 
  updatePaymentMethod, 
  deletePaymentMethod, 
  getTransactionHistory,
  checkAndUpdateUserVerification 
} from "@/callAPI/payment"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2 },
  },
}

const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
}

const floatingVariants = {
  float: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: "easeInOut",
    },
  },
}

export default function PaymentPage({ showHeader = true }) {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isEditingMethod, setIsEditingMethod] = useState(false)
  const [editingMethodId, setEditingMethodId] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0
  })
  
  // Form states
  const [cardForm, setCardForm] = useState({
    type: "visa",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    isDefault: false
  })
  
  const [editForm, setEditForm] = useState({
    type: "visa",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    isDefault: false
  })
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    method: "",
    description: ""
  })
  
  const [depositForm, setDepositForm] = useState({
    amount: "",
    method: "",
    description: ""
  })

  const { toast } = useToast()
  const { t } = useTranslations()
  const router = useRouter()

  // Load payment data
  useEffect(() => {
    loadPaymentData()
  }, [])

  const loadPaymentData = async () => {
    try {
      setIsLoading(true)
      
      // Load payment methods
      const methodsResult = await getPaymentMethods()
      if (methodsResult.success) {
        setPaymentMethods(methodsResult.data)
      }
      
      // Load current balance
      const balanceResult = await getCurrentBalance()
      if (balanceResult.success) {
        setBalance(balanceResult.data.balance)
        setTransactions(balanceResult.data.transactions)
        
        // Calculate stats
        const deposits = balanceResult.data.transactions.filter(t => t.type === "deposit")
        const withdrawals = balanceResult.data.transactions.filter(t => t.type === "withdraw")
        const pending = balanceResult.data.transactions.filter(t => t.status === "pending")
        
        setStats({
          totalDeposits: deposits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          totalWithdrawals: withdrawals.reduce((sum, t) => sum + parseFloat(t.amount), 0),
          pendingTransactions: pending.length
        })
      }
    } catch (error) {
      console.error("Error loading payment data:", error)
      toast({
        title: t("error") || "Error",
        description: t("failedToLoadPaymentData") || "Failed to load payment data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await getCookie()
        if (token) {
          const decoded = await decodedToken()
          if (decoded?.id) {
            const userData = await getUserById(decoded.id)
            setUser(userData.data)
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }
    
    fetchUserData()
  }, [])

  const getPaymentIcon = (type) => {
    const iconProps = { className: "h-6 w-6" }
    switch (type) {
      case "visa":
        return <CreditCard {...iconProps} className="h-6 w-6 text-blue-600" />
      case "mastercard":
        return <CreditCard {...iconProps} className="h-6 w-6 text-red-600" />
      case "paypal":
        return <Smartphone {...iconProps} className="h-6 w-6 text-blue-500" />
      case "bank":
        return <Building2 {...iconProps} className="h-6 w-6 text-green-600" />
      default:
        return <CreditCard {...iconProps} />
    }
  }

  const handleAddPaymentMethod = async () => {
    setIsLoading(true)
    try {
      const result = await addPaymentMethod({
        type: cardForm.type,
        card_number: cardForm.cardNumber,
        expiry_date: cardForm.expiryDate,
        cvv: cardForm.cvv,
        holder_name: cardForm.holderName,
        is_default: cardForm.isDefault
      })
      
      if (result.success) {
        await loadPaymentData() // Reload payment data
        setShowAddForm(false)
        setCardForm({
          type: "visa",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          holderName: "",
          isDefault: false
        })
        
        toast({
          title: t("success") || "Success",
          description: t("paymentMethodAdded") || "Payment method added successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToAddPayment") || "Failed to add payment method",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawForm.amount || !withdrawForm.method) {
      toast({
        title: t("error") || "Error",
        description: t("fillAllFields") || "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    if (parseFloat(withdrawForm.amount) > balance) {
      toast({
        title: t("error") || "Error",
        description: t("insufficientBalance") || "Insufficient balance",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await withdrawCash(
        parseFloat(withdrawForm.amount),
        withdrawForm.method,
        withdrawForm.description
      )
      
      if (result.success) {
        await loadPaymentData() // Reload payment data
        setWithdrawForm({ amount: "", method: "", description: "" })
        
        toast({
          title: t("success") || "Success",
          description: t("withdrawalSuccessful") || "Withdrawal requested successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("withdrawalFailed") || "Withdrawal failed",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositForm.amount || !depositForm.method) {
      toast({
        title: t("error") || "Error",
        description: t("fillAllFields") || "Please fill all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await addCashBalance(
        parseFloat(depositForm.amount),
        depositForm.description || "Cash deposit"
      )
      
      if (result.success) {
        await loadPaymentData() // Reload payment data
        setDepositForm({ amount: "", method: "", description: "" })
        
        // Check if user got verified
        const verificationResult = await checkAndUpdateUserVerification(user?.id, parseFloat(depositForm.amount))
        if (verificationResult.success && verificationResult.data.verified) {
          toast({
            title: t("congratulations") || "Congratulations!",
            description: t("accountVerified") || "Your account has been verified!",
            variant: "default"
          })
        }
        
        toast({
          title: t("success") || "Success",
          description: t("depositSuccessful") || "Deposit successful",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("depositFailed") || "Deposit failed",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMethod = async (methodId) => {
    setIsLoading(true)
    try {
      const result = await deletePaymentMethod(methodId)
      
      if (result.success) {
        await loadPaymentData() // Reload payment data
        
        toast({
          title: t("success") || "Success",
          description: t("paymentMethodDeleted") || "Payment method deleted successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToDeletePayment") || "Failed to delete payment method",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMethod = (method) => {
    setEditingMethodId(method.id)
    setEditForm({
      type: method.type,
      cardNumber: method.card_number || "",
      expiryDate: method.expiry_date || "",
      cvv: "",
      holderName: method.holder_name || "",
      isDefault: method.is_default || false
    })
    setIsEditingMethod(true)
  }

  const handleUpdateMethod = async () => {
    setIsLoading(true)
    try {
      const result = await updatePaymentMethod(editingMethodId, {
        type: editForm.type,
        card_number: editForm.cardNumber,
        expiry_date: editForm.expiryDate,
        cvv: editForm.cvv,
        holder_name: editForm.holderName,
        is_default: editForm.isDefault
      })
      
      if (result.success) {
        await loadPaymentData() // Reload payment data
        setIsEditingMethod(false)
        setEditingMethodId(null)
        setEditForm({
          type: "visa",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          holderName: "",
          isDefault: false
        })
        
        toast({
          title: t("success") || "Success",
          description: t("paymentMethodUpdated") || "Payment method updated successfully",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: t("error") || "Error",
        description: error.message || t("failedToUpdatePayment") || "Failed to update payment method",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditingMethod(false)
    setEditingMethodId(null)
    setEditForm({
      type: "visa",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      holderName: "",
      isDefault: false
    })
  }

  return (
    <motion.div 
      className="container py-8 relative overflow-hidden min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-20 right-10 text-primary/5" variants={floatingVariants} animate="float">
          <Wallet className="h-32 w-32" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-10 text-secondary/5"
          variants={floatingVariants}
          animate="float"
          transition={{ delay: 2 }}
        >
          <DollarSign className="h-24 w-24" />
        </motion.div>
      </div>

      {/* Header Section */}
      {showHeader && ( <motion.div className="mb-6 relative z-10" variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
           
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {t("payment") || "Payment & Wallet"}
            </motion.h1>
          </div>
          
          {user && (
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage
                  src={user?.avatar ? `https://deel-deal-directus.csiwm3.easypanel.host/assets/${user.avatar}` : "/placeholder.svg"}
                  alt={user?.first_name || t("account")}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {String(user?.first_name).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.first_name || t("account")}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
)}
      {/* Balance Overview Card */}
      <motion.div className="mb-8 relative z-10" variants={itemVariants}>
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="shadow-xl border-0 bg-gradient-to-br from-primary to-secondary text-primary-foreground overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {t("currentBalance") || "Current Balance"}
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    {t("availableFunds") || "Available funds in your wallet"}
                  </CardDescription>
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                >
                  <PiggyBank className="h-12 w-12 text-white/80" />
                </motion.div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between">
                <motion.div
                  className="text-4xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  ${balance.toFixed(2)}
                </motion.div>
                <div className="flex space-x-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setActiveTab("deposit")}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {t("deposit") || "Deposit"}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setActiveTab("withdraw")}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t("withdraw") || "Withdraw"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Main Tabs */}
      <motion.div className="relative z-10" variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted p-2 rounded-xl shadow-lg">
              {[
                { value: "overview", icon: Wallet, label: t("overview") || "Overview" },
                { value: "methods", icon: CreditCard, label: t("paymentMethods") || "Payment Methods" },
                { value: "deposit", icon: Upload, label: t("deposit") || "Deposit" },
                { value: "withdraw", icon: Download, label: t("withdraw") || "Withdraw" }
              ].map((tab, index) => (
                <motion.div
                  key={tab.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <TabsTrigger
                    value={tab.value}
                    className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300 w-full"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
                  </TabsTrigger>
                </motion.div>
              ))}
            </TabsList>
          </motion.div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-6">
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats */}
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("totalDeposits") || "Total Deposits"}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">${stats.totalDeposits.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Total deposited amount</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("totalWithdrawals") || "Total Withdrawals"}
                      </CardTitle>
                      <Download className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">${stats.totalWithdrawals.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">Total withdrawn amount</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={cardVariants} whileHover="hover">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("activeMethods") || "Active Methods"}
                      </CardTitle>
                      <CreditCard className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-primary">{paymentMethods.length}</div>
                      <p className="text-xs text-muted-foreground">Payment methods connected</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div variants={cardVariants} whileHover="hover" className="md:col-span-2 lg:col-span-3">
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" />
                        {t("recentTransactions") || "Recent Transactions"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.slice(0, 3).map((transaction, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            whileHover={{ scale: 1.01 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                transaction.type === "deposit" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                              }`}>
                                {transaction.type === "deposit" ? 
                                  <Upload className="h-4 w-4" /> : 
                                  <Download className="h-4 w-4" />
                                }
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description || `${transaction.type} transaction`}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(transaction.date_created).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${
                                transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                              }`}>
                                {transaction.type === "deposit" ? "+" : "-"}${parseFloat(transaction.amount).toFixed(2)}
                              </span>
                              <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                                {transaction.status}
                              </Badge>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="methods" className="mt-6">
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <div className="space-y-6">
                {/* Add New Method Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full bg-primary hover:bg-secondary text-primary-foreground shadow-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addPaymentMethod") || "Add Payment Method"}
                  </Button>
                </motion.div>

                {/* Add Payment Method Form */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            {t("addNewPaymentMethod") || "Add New Payment Method"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="payment-type">{t("paymentType") || "Payment Type"}</Label>
                              <Select value={cardForm.type} onValueChange={(value) => setCardForm(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectType") || "Select payment type"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visa">Visa</SelectItem>
                                  <SelectItem value="mastercard">Mastercard</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(cardForm.type === "visa" || cardForm.type === "mastercard") && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="card-number">{t("cardNumber") || "Card Number"}</Label>
                                  <Input
                                    id="card-number"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardForm.cardNumber}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="expiry">{t("expiryDate") || "Expiry Date"}</Label>
                                  <Input
                                    id="expiry"
                                    placeholder="MM/YY"
                                    value={cardForm.expiryDate}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvv">{t("cvv") || "CVV"}</Label>
                                  <Input
                                    id="cvv"
                                    placeholder="123"
                                    value={cardForm.cvv}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
                                  />
                                </div>
                              </>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="holder-name">{t("holderName") || "Account Holder Name"}</Label>
                              <Input
                                id="holder-name"
                                placeholder="John Doe"
                                value={cardForm.holderName}
                                onChange={(e) => setCardForm(prev => ({ ...prev, holderName: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="default-method"
                                checked={cardForm.isDefault}
                                onChange={(e) => setCardForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                className="rounded"
                              />
                              <Label htmlFor="default-method">{t("setAsDefault") || "Set as default method"}</Label>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                {t("cancel") || "Cancel"}
                              </Button>
                              <Button 
                                onClick={handleAddPaymentMethod}
                                disabled={isLoading}
                                className="bg-primary hover:bg-secondary"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("adding") || "Adding..."}
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t("addMethod") || "Add Method"}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Payment Methods List */}
                <div className="grid gap-4 md:grid-cols-2">
                  {paymentMethods.map((method, index) => (
                    <motion.div
                      key={method.id}
                      variants={cardVariants}
                      whileHover="hover"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted relative overflow-hidden">
                        {method.is_default && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-primary text-primary-foreground">
                              <Star className="h-3 w-3 mr-1" />
                              {t("default") || "Default"}
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getPaymentIcon(method.type)}
                              <div>
                                <CardTitle className="text-lg capitalize">
                                  {method.type}
                                </CardTitle>
                                <CardDescription>
                                  {method.card_number ? `**** **** **** ${method.card_number.slice(-4)}` : method.email || method.account_number}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      {method.is_verified ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                      ) : (
                                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="bg-primary text-primary-foreground">
                                    <p className="text-sm">
                                      {method.is_verified ? (t("verified") || "Verified Method") : (t("notVerified") || "Not Verified")}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              {method.holder_name && (
                                <p className="text-sm text-muted-foreground">{method.holder_name}</p>
                              )}
                              {method.expiry_date && (
                                <p className="text-sm text-muted-foreground">Expires: {method.expiry_date}</p>
                              )}
                            </div>
                            
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditMethod(method)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteMethod(method.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {/* Edit Payment Method Form */}
                <AnimatePresence>
                  {isEditingMethod && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5 text-primary" />
                            {t("editPaymentMethod") || "Edit Payment Method"}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-payment-type">{t("paymentType") || "Payment Type"}</Label>
                              <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("selectType") || "Select payment type"} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="visa">Visa</SelectItem>
                                  <SelectItem value="mastercard">Mastercard</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {(editForm.type === "visa" || editForm.type === "mastercard") && (
                              <>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-card-number">{t("cardNumber") || "Card Number"}</Label>
                                  <Input
                                    id="edit-card-number"
                                    placeholder="1234 5678 9012 3456"
                                    value={editForm.cardNumber}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-expiry">{t("expiryDate") || "Expiry Date"}</Label>
                                  <Input
                                    id="edit-expiry"
                                    placeholder="MM/YY"
                                    value={editForm.expiryDate}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-cvv">{t("cvv") || "CVV"}</Label>
                                  <Input
                                    id="edit-cvv"
                                    placeholder="123"
                                    value={editForm.cvv}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, cvv: e.target.value }))}
                                  />
                                </div>
                              </>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="edit-holder-name">{t("holderName") || "Account Holder Name"}</Label>
                              <Input
                                id="edit-holder-name"
                                placeholder="John Doe"
                                value={editForm.holderName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, holderName: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="edit-default-method"
                                checked={editForm.isDefault}
                                onChange={(e) => setEditForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                                className="rounded"
                              />
                              <Label htmlFor="edit-default-method">{t("setAsDefault") || "Set as default method"}</Label>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button variant="outline" onClick={cancelEdit}>
                                {t("cancel") || "Cancel"}
                              </Button>
                              <Button 
                                onClick={handleUpdateMethod}
                                disabled={isLoading}
                                className="bg-primary hover:bg-secondary"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("updating") || "Updating..."}
                                  </>
                                ) : (
                                  <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t("updateMethod") || "Update Method"}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </TabsContent>

          {/* Deposit Tab */}
          <TabsContent value="deposit" className="mt-6">
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    {t("depositFunds") || "Deposit Funds"}
                  </CardTitle>
                  <CardDescription>
                    {t("addMoneyToWallet") || "Add money to your wallet using your preferred payment method"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount">{t("amount") || "Amount"} ($)</Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          placeholder="0.00"
                          value={depositForm.amount}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                          className="text-2xl font-bold"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deposit-method">{t("paymentMethod") || "Payment Method"}</Label>
                        <Select value={depositForm.method} onValueChange={(value) => setDepositForm(prev => ({ ...prev, method: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectMethod") || "Select payment method"} />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id.toString()}>
                                <div className="flex items-center space-x-2">
                                  {getPaymentIcon(method.type)}
                                  <span className="capitalize">
                                    {method.type} {method.card_number ? `****${method.card_number.slice(-4)}` : method.email || method.account_number}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deposit-description">{t("description") || "Description"} ({t("optional") || "Optional"})</Label>
                        <Input
                          id="deposit-description"
                          placeholder={t("addNote") || "Add a note..."}
                          value={depositForm.description}
                          onChange={(e) => setDepositForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          {t("secureTransaction") || "Your transaction is secured with bank-level encryption"}
                        </AlertDescription>
                      </Alert>
                      
                      <Alert>
                        <Star className="h-4 w-4" />
                        <AlertDescription>
                          {t("verificationNotice") || "Deposits of 10% or more of the top product price (max $10,000) will automatically verify your account!"}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="font-medium mb-2">{t("transactionSummary") || "Transaction Summary"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t("amount") || "Amount"}:</span>
                            <span className="font-medium">${depositForm.amount || "0.00"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("processingFee") || "Processing Fee"}:</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>{t("total") || "Total"}:</span>
                            <span>${depositForm.amount || "0.00"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleDeposit}
                      disabled={isLoading || !depositForm.amount || !depositForm.method}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("processing") || "Processing..."}
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {t("depositNow") || "Deposit Now"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw" className="mt-6">
            <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-muted">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-red-600" />
                    {t("withdrawFunds") || "Withdraw Funds"}
                  </CardTitle>
                  <CardDescription>
                    {t("withdrawMoney") || "Withdraw money from your wallet to your preferred payment method"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount">{t("amount") || "Amount"} ($)</Label>
                        <div className="relative">
                          <Input
                            id="withdraw-amount"
                            type="number"
                            placeholder="0.00"
                            max={balance}
                            value={withdrawForm.amount}
                            onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="text-2xl font-bold pr-20"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs"
                            onClick={() => setWithdrawForm(prev => ({ ...prev, amount: balance.toString() }))}
                          >
                            {t("max") || "MAX"}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t("availableBalance") || "Available balance"}: ${balance.toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-method">{t("withdrawTo") || "Withdraw To"}</Label>
                        <Select value={withdrawForm.method} onValueChange={(value) => setWithdrawForm(prev => ({ ...prev, method: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectMethod") || "Select withdrawal method"} />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.filter(method => method.is_verified).map((method) => (
                              <SelectItem key={method.id} value={method.id.toString()}>
                                <div className="flex items-center space-x-2">
                                  {getPaymentIcon(method.type)}
                                  <span className="capitalize">
                                    {method.type} {method.card_number ? `****${method.card_number.slice(-4)}` : method.email || method.account_number}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-description">{t("description") || "Description"} ({t("optional") || "Optional"})</Label>
                        <Input
                          id="withdraw-description"
                          placeholder={t("addNote") || "Add a note..."}
                          value={withdrawForm.description}
                          onChange={(e) => setWithdrawForm(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {t("withdrawalTime") || "Withdrawals typically take 1-3 business days to process"}
                        </AlertDescription>
                      </Alert>
                      
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="font-medium mb-2">{t("withdrawalSummary") || "Withdrawal Summary"}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>{t("amount") || "Amount"}:</span>
                            <span className="font-medium">${withdrawForm.amount || "0.00"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t("withdrawalFee") || "Withdrawal Fee"}:</span>
                            <span className="font-medium">$0.00</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-bold">
                            <span>{t("youWillReceive") || "You will receive"}:</span>
                            <span>${withdrawForm.amount || "0.00"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleWithdraw}
                      disabled={isLoading || !withdrawForm.amount || !withdrawForm.method || parseFloat(withdrawForm.amount) > balance}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t("processing") || "Processing..."}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          {t("withdrawNow") || "Withdraw Now"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
