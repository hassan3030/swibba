"use client"

import { useState , useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  Box,
  DollarSign, 
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/lib/language-provider"
import { useTranslations } from "@/lib/use-translations"
import { getUserById , getAllUsers  , logout } from "@/callAPI/users"
import { getProducts , getProductById ,getProductTopPrice } from "@/callAPI/products"
import { getAllOffers } from "@/callAPI/swap"
// import {  } from "@/callAPI/utiles"

// Mock data for analytics
const analyticsData = {
  totalSales: 12589.99,
  totalOrders: 156,
  totalUsers: 423,
  totalProducts: 89,
  recentSales: [
    { id: 1, date: "2023-05-15", amount: 129.99, customer: "John Doe" },
    { id: 2, date: "2023-05-14", amount: 259.99, customer: "Jane Smith" },
    { id: 3, date: "2023-05-14", amount: 79.99, customer: "Mike Johnson" },
    { id: 4, date: "2023-05-13", amount: 349.99, customer: "Sarah Williams" },
    { id: 5, date: "2023-05-13", amount: 199.99, customer: "Alex Brown" },
  ],
  topProducts: [
    {
      id: 1,
      name: "Wireless Earbuds",
      sales: 42,
      revenue: 3359.58,
      image: "/placeholder.svg?height=40&width=40&text=Earbuds",
    },
    {
      id: 2,
      name: "Smart Watch",
      sales: 38,
      revenue: 13299.62,
      image: "/placeholder.svg?height=40&width=40&text=Watch",
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      sales: 31,
      revenue: 2479.69,
      image: "/placeholder.svg?height=40&width=40&text=Speaker",
    },
  ],
}

// Mock data for users
// const users = [
//   { id: 1, name: "John Doe", email: "john.doe@example.com", role: "Customer", status: "active", joined: "2023-01-15" },
//   {
//     id: 2,
//     name: "Jane Smith",
//     email: "jane.smith@example.com",
//     role: "Customer",
//     status: "active",
//     joined: "2023-02-20",
//   },
//   {
//     id: 3,
//     name: "Mike Johnson",
//     email: "mike.johnson@example.com",
//     role: "Customer",
//     status: "inactive",
//     joined: "2023-03-10",
//   },
//   {
//     id: 4,
//     name: "Sarah Williams",
//     email: "sarah.williams@example.com",
//     role: "Admin",
//     status: "active",
//     joined: "2022-11-05",
//   },
//   {
//     id: 5,
//     name: "Alex Brown",
//     email: "alex.brown@example.com",
//     role: "Customer",
//     status: "active",
//     joined: "2023-04-22",
//   },
// ]

// Mock data for products
// const products = [
//   {
//     id: 1,
//     name: "Wireless Earbuds",
//     price: 79.99,
//     category: "Electronics",
//     stock: 45,
//     image: "/placeholder.svg?height=40&width=40&text=Earbuds",
//   },
//   {
//     id: 2,
//     name: "Smart Watch",
//     price: 349.99,
//     category: "Electronics",
//     stock: 28,
//     image: "/placeholder.svg?height=40&width=40&text=Watch",
//   },
//   {
//     id: 3,
//     name: "Bluetooth Speaker",
//     price: 79.99,
//     category: "Electronics",
//     stock: 36,
//     image: "/placeholder.svg?height=40&width=40&text=Speaker",
//   },
//   {
//     id: 4,
//     name: "Laptop Stand",
//     price: 49.99,
//     category: "Accessories",
//     stock: 52,
//     image: "/placeholder.svg?height=40&width=40&text=Stand",
//   },
//   {
//     id: 5,
//     name: "Wireless Keyboard",
//     price: 89.99,
//     category: "Accessories",
//     stock: 19,
//     image: "/placeholder.svg?height=40&width=40&text=Keyboard",
//   },
// ]

// Mock data for orders
// const orders = [
//   {
//     id: "ORD-001",
//     date: "2023-05-15",
//     customer: "John Doe",
//     total: 129.99,
//     status: "delivered",
//     items: 2,
//   },
//   {
//     id: "ORD-002",
//     date: "2023-05-14",
//     customer: "Jane Smith",
//     total: 259.99,
//     status: "processing",
//     items: 1,
//   },
//   {
//     id: "ORD-003",
//     date: "2023-05-14",
//     customer: "Mike Johnson",
//     total: 79.99,
//     status: "delivered",
//     items: 1,
//   },
//   {
//     id: "ORD-004",
//     date: "2023-05-13",
//     customer: "Sarah Williams",
//     total: 349.99,
//     status: "shipped",
//     items: 3,
//   },
//   {
//     id: "ORD-005",
//     date: "2023-05-13",
//     customer: "Alex Brown",
//     total: 199.99,
//     status: "processing",
//     items: 2,
//   },
// ]

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const { isRTL } = useLanguage()
  const { t } = useTranslations()
  const [ users ,  setUsers ] = useState([])
  const [ usersCount ,  setUsersCount ] = useState(0)
  const [ user ,  setUser ] = useState([])

 const [products ,  setProducts ]  = useState([])
  const [ productsCount ,  setProductsCount ] = useState(0)
  const [ product ,  setProduct ] = useState([])

 const [topProducts ,  setTopProducts ]  = useState([])
  const [topProductsCount ,  setTopProductsCount ] = useState(0)
  const [ topProduct ,  setTopProduct ] = useState([])

  

 const [ offers ,  setOffers ] = useState([])
  const [ offersCount ,  setOffersCount ] = useState(0)
  const [ offersSumCash ,  setOffersSumCash ] = useState(0)
  const [ offer ,  setoffer] = useState([])


  const handleLogout = async() => {
    await logout()
    router.push("/")
  }

  const handleGetUsers = async() => {
   const users =  await getAllUsers()
   setUsers(users.data)
   setUsersCount(users.count)
   console.log("setUsers" ,users.count)
   console.log("setUsersCount" , users.data)
  }
  const handleGetProducts = async() => {
   const prods =  await getProducts()
   setProducts(prods.data)
   setProductsCount(prods.count)
   console.log("setProducts" ,prods.count)
   console.log("setProductsCount" , prods.data)
  }
  const handleGetSwaps = async() => {
   const swaps =  await getAllOffers()
   setOffers(swaps.data)
   setOffersCount(swaps.count)
   console.log("setOffers" ,swaps.count)
   console.log("setOffersCount" , swaps.data)
  }

  const handleGetTopProducts = async() => {
   const Products =  await getProductTopPrice()
   setTopProducts(Products.data)
   setTopProductsCount(Products.count)
   console.log("setOffers" ,Products.count)
   console.log("setTopProductsCount" , Products.data)
  }

  const sidebarItems = [
    { id: "overview", label: t("dashboard"), icon: LayoutDashboard },
    { id: "orders", label: t("orders"), icon: ShoppingBag },
    { id: "products", label: t("products"), icon: Package },
    { id: "users", label: t("users"), icon: Users },
    { id: "analytics", label: t("analytics"), icon: BarChart3 },
    { id: "settings", label: t("settings"), icon: Settings },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
    }
  }

  useEffect(() => {
   handleGetUsers()
    handleGetProducts()
handleGetSwaps()
handleGetTopProducts()
  }, [])

  return (
    <div className="container py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div className="hidden md:block">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-orange text-white">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{t("adminPanel")}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>

            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeTab === item.id
                      ? "bg-primary-yellow text-gray-900"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}

              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>{t("logout")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 gap-2">
              <TabsTrigger value="overview">{t("dashboard")}</TabsTrigger>
              <TabsTrigger value="orders">{t("orders")}</TabsTrigger>
              <TabsTrigger value="products">{t("products")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div>
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t("adminPanel")}</h1>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* in the future */}
                {/* <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("sales")}</p>
                      <h3 className="text-2xl font-bold">LE{analyticsData.totalSales.toLocaleString()}</h3>
                    </div>
                    <div className="rounded-full bg-primary-yellow/20 p-3 text-primary-yellow">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card> */}

                <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("swaps")||"Swaps"}</p>
                      <h3 className="text-2xl font-bold">{offersCount}</h3>
                    </div>
                    <div className="rounded-full bg-secondary-orange/20 p-3 text-secondary-orange">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("users")}</p>
                      <h3 className="text-2xl font-bold">{usersCount}</h3>
                    </div>
                    <div className="rounded-full bg-accent-orange/20 p-3 text-accent-orange">
                      <Users className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t("products")}</p>
                      <h3 className="text-2xl font-bold">{productsCount}</h3>
                    </div>
                    <div className="rounded-full bg-deep-orange/20 p-3 text-deep-orange">
                      <Box className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Swaps</CardTitle>
                    <CardDescription>Latest transactions between users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {offers.map((offer) => (
                        <div key={offer.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{offer.name}</p>
                            {/* <p className="text-sm text-muted-foreground">{new Date(offer.date).toLocaleDateString()}</p> */}
                          </div>
                          <p className="font-bold">${sale.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best selling products this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.topProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-4">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} sold</p>
                          </div>
                          <p className="font-bold">${product.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("orders")}</h1>
                <Button className="bg-primary-orange text-white hover:bg-deep-orange">Export</Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Order ID</th>
                          <th className="px-4 py-3 text-left font-medium">Date</th>
                          <th className="px-4 py-3 text-left font-medium">Customer</th>
                          <th className="px-4 py-3 text-left font-medium">Items</th>
                          <th className="px-4 py-3 text-left font-medium">Total</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                          <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b">
                            <td className="px-4 py-3">{order.id}</td>
                            <td className="px-4 py-3">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{order.customer}</td>
                            <td className="px-4 py-3">{order.items}</td>
                            <td className="px-4 py-3">${order.total.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-1 text-xs ${getStatusColor(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("products")}</h1>
                <Button className="bg-primary-orange text-white hover:bg-deep-orange">Add Product</Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Product</th>
                          <th className="px-4 py-3 text-left font-medium">Category</th>
                          <th className="px-4 py-3 text-left font-medium">Price</th>
                          <th className="px-4 py-3 text-left font-medium">Stock</th>
                          <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                                  <Image
                                    src={product.image || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-medium">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{product.category}</td>
                            <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                            <td className="px-4 py-3">{product.stock}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t("users")}</h1>
                <Button className="bg-primary-orange text-white hover:bg-deep-orange">Add User</Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left font-medium">Name</th>
                          <th className="px-4 py-3 text-left font-medium">Email</th>
                          <th className="px-4 py-3 text-left font-medium">Role</th>
                          <th className="px-4 py-3 text-left font-medium">Status</th>
                          <th className="px-4 py-3 text-left font-medium">Joined</th>
                          <th className="px-4 py-3 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="px-4 py-3 font-medium">{user.name}</td>
                            <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3">{user.role}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  user.status === "active"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                }`}
                              >
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3">{new Date(user.joined).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t("analytics")}</h1>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                    <CardDescription>Total sales over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Sales chart will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Sources</CardTitle>
                    <CardDescription>Where your customers are coming from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Traffic sources chart will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Sales by Category</CardTitle>
                    <CardDescription>Revenue breakdown by product category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full rounded-lg bg-muted p-4">
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">Category sales chart will be displayed here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">{t("settings")}</h1>

              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Store Name</label>
                      <input type="text" className="w-full rounded-md border p-2" defaultValue="Noon Store" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Store Email</label>
                      <input
                        type="email"
                        className="w-full rounded-md border p-2"
                        defaultValue="contact@noonstore.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Store Description</label>
                    <textarea
                      className="w-full rounded-md border p-2"
                      rows={4}
                      defaultValue="Your one-stop shop for all your needs."
                    ></textarea>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Store Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          Logo
                        </div>
                      </div>
                      <Button variant="outline">Upload New Logo</Button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Currency</label>
                    <select className="w-full rounded-md border p-2">
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="EGP">EGP - Egyptian Pound</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-primary-orange text-white hover:bg-deep-orange">Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
