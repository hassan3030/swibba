"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import {
  Search,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ChevronLeft,
  Download,
  Plus,
  Home,
  ShoppingBag, 
  MessageCircle,
  Settings,
  HelpCircle,
  ArrowBigDown,
  ArrowBigUp,
} from "lucide-react"
import { getAllOffers, getOfferItemsByOfferId, getReviewsByOfferId, getOfferById, getOffeReceived } from "@/callAPI/swap"
import { getProductById } from "@/callAPI/products"
import { getUserById } from "@/callAPI/users"
import { decodedToken, getCookie, mediaURL } from "@/callAPI/utiles"
import { useTranslations } from "@/lib/use-translations"
import { useLanguage } from "@/lib/language-provider"
import Image from "next/image"
import Link from "next/link"
import ReviewDisplay from "@/components/reviews/review-display"
import { useRouter } from "next/navigation"


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

const ExpandedOfferView = ({ offer, currentUserId, t, isRTL }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const itemsRes = await getOfferItemsByOfferId(offer.id);
        let myItems = [];
        let theirItems = [];

        if (itemsRes.success) {
          const itemPromises = itemsRes.data.map(async (item) => {
            const productRes = await getProductById(item.item_id);
            if (productRes.success) {
              return { ...item, product: productRes.data };
            }
            return null;
          });
          const populatedItems = (await Promise.all(itemPromises)).filter(Boolean);

          // Extract user IDs from the offer
          const getUserIdFromOffer = (userField) => {
            if (!userField) return null;
            if (typeof userField === 'object' && userField !== null) {
              return userField.id || null;
            }
            return String(userField);
          };
          
          const offerFromUserId = getUserIdFromOffer(offer.from_user_id);
          const offerToUserId = getUserIdFromOffer(offer.to_user_id);
          const currentUserIdStr = String(currentUserId);
          
          // Categorize items based on which user offered them (offered_by field)
          // This ensures products are correctly assigned to "myOffer" or "theirOffer"
          const fromUserIdStr = offerFromUserId ? String(offerFromUserId) : null;
          const toUserIdStr = offerToUserId ? String(offerToUserId) : null;
          
          if (fromUserIdStr && toUserIdStr) {
            // Determine which user ID represents "my items"
            let myUserIdForItems = null;
            if (fromUserIdStr === currentUserIdStr) {
              // Current user is the sender, so my items are those offered by from_user_id
              myUserIdForItems = fromUserIdStr;
            } else if (toUserIdStr === currentUserIdStr) {
              // Current user is the receiver, so my items are those offered by to_user_id
              myUserIdForItems = toUserIdStr;
            }
            
            // Separate items by offered_by field - this is the key field that determines ownership
            if (myUserIdForItems) {
              myItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '');
                return offeredBy === myUserIdForItems;
              });
              
              theirItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '');
                return offeredBy !== myUserIdForItems;
              });
            } else {
              // Current user is not in this offer, categorize based on from/to structure
              myItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '');
                return offeredBy === fromUserIdStr;
              });
              
              theirItems = populatedItems.filter(item => {
                const offeredBy = String(item.offered_by || '');
                return offeredBy === toUserIdStr;
              });
            }
          } else {
            // Fallback: if user IDs are missing, put all items in theirItems
            theirItems = populatedItems;
            myItems = [];
          }
        }

        const reviewsRes = await getReviewsByOfferId(offer.id);
        let reviews = [];
        if (reviewsRes.success) {
          const reviewPromises = reviewsRes.data.map(async (review) => {
            const userRes = await getUserById(review.from_user_id);
            if (userRes.success) {
              return { ...review, user: userRes.data };
            }
            return review;
          });
          reviews = await Promise.all(reviewPromises);
        }

        setDetails({ myItems, theirItems, reviews });
      } catch (error) {
        console.error("Error fetching offer details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (offer.id) {
        fetchDetails();
    }
  }, [offer.id, currentUserId]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">{t("loadingDetails") || "Loading details..."}</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-6 text-center text-destructive">
        {t("errorLoadingDetails") || "Could not load offer details."}
      </div>
    );
  }

  const renderProduct = (item, imgSize = 48) => (
    <div key={item.id} className="flex items-center gap-3 py-1.5">
      <Image
        src={item.product?.images?.[0]?.directus_files_id?.filename_disk ? `${mediaURL}${item.product.images[0].directus_files_id.filename_disk}` : "/placeholder.svg"}
        alt={item.product?.name || "Product image"}
        width={imgSize}
        height={imgSize}
        className="rounded-md object-cover w-20 h-20"
      />
      <div className="flex-1 text-sm">
        <p className="font-semibold truncate">{item.product?.name}</p>
        <p className="text-xs text-muted-foreground">
          {t("quantity") || "Qty"}: {item.quantity}
        </p>
      </div>
      <div className="text-sm font-medium">
        {(item.product?.price * item.quantity).toFixed(2)} {t("egp") || "EGP"}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-background border-t">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div> 
            
          <h4 className="font-semibold text-sm mb-2">{t("myOffer") || "My Offer"}</h4>
          <div className="space-y-1">
            {details.myItems.length > 0 ? details.myItems.map((item) => renderProduct(item, 40)) : <p className="text-xs text-muted-foreground">{t("noItems") || "No items in this offer."}</p>}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-2">{t("theirOffer") || "Their Offer"}</h4>
          <div className="space-y-1">
            {details.theirItems.length > 0 ? details.theirItems.map((item) => renderProduct(item, 56)) : <p className="text-xs text-muted-foreground">{t("noItems") || "No items in this offer."}</p>}
          </div>
        </div>
      </div>
      {details.reviews.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <h4 className="font-semibold text-sm mb-3">{t("reviewsForThisOffer") || "Reviews for this Offer"}</h4>
            <div className="space-y-4">
              {details.reviews.map(review => (
                <div key={review.id} className="flex gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={review.user?.avatar ? `${mediaURL}${review.user.avatar}` : "/placeholder-user.jpg"} />
                    <AvatarFallback>{review.user?.first_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{review.user?.first_name} {review.user?.last_name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(review.date_created)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function OffersDetailsPage() {
  const [offers, setOffers] = useState([])
  const [filteredOffers, setFilteredOffers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("completed")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [expandedOffer, setExpandedOffer] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [sortOption, setSortOption] = useState("date_desc")
  const [showFilter, setShowFilter] = useState(false)
  const { t } = useTranslations()
  const { isRTL } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const decoded = await decodedToken();
        if (decoded && decoded.id) {
          setCurrentUserId(decoded.id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserId();
  }, []);

  const fetchOffers = useCallback(async () => {
    if (!currentUserId) return; // Wait for currentUserId to be set
    
    setIsLoading(true)
    try {
      // Fetch offers where user is sender (from_user_id)
      const sentOffersRes = await getOfferById(currentUserId)
      // Fetch offers where user is receiver (to_user_id)
      const receivedOffersRes = await getOffeReceived(currentUserId)
      
      // Combine both arrays and remove duplicates based on offer ID
      const allUserOffers = []
      const offerIds = new Set()
      
      if (sentOffersRes.success && sentOffersRes.data) {
        sentOffersRes.data.forEach(offer => {
          if (!offerIds.has(offer.id)) {
            offerIds.add(offer.id)
            allUserOffers.push(offer)
          }
        })
      }
      
      if (receivedOffersRes.success && receivedOffersRes.data) {
        receivedOffersRes.data.forEach(offer => {
          if (!offerIds.has(offer.id)) {
            offerIds.add(offer.id)
            allUserOffers.push(offer)
          }
        })
      }
      
      if (allUserOffers.length > 0) {
        // Process each offer to add otherUser, myItems, and theirItems
        const processedOffers = await Promise.all(
          allUserOffers.map(async (offer) => {
            // Extract user IDs - handle both object (expanded) and string ID formats
            const getUserId = (userField) => {
              if (!userField) return null;
              if (typeof userField === 'object' && userField !== null) {
                return userField.id || null;
              }
              return String(userField);
            };
            
            const fromUserId = getUserId(offer.from_user_id);
            const toUserId = getUserId(offer.to_user_id);
            const currentUserIdStr = String(currentUserId);
            
            // Fetch both users (sender and receiver) for the offer
            let fromUser = null;
            let toUser = null;
            let otherUser = null;
            let myUser = null;
            
            // Fetch from_user (sender)
            if (fromUserId) {
              if (typeof offer.from_user_id === 'object' && offer.from_user_id !== null && offer.from_user_id.id) {
                fromUser = offer.from_user_id;
              } else {
                try {
                  const userRes = await getUserById(fromUserId);
                  if (userRes.success && userRes.data) {
                    fromUser = userRes.data;
                  }
                } catch (error) {
                  console.error("Error fetching from user:", error);
                }
              }
            }
            
            // Fetch to_user (receiver)
            if (toUserId) {
              if (typeof offer.to_user_id === 'object' && offer.to_user_id !== null && offer.to_user_id.id) {
                toUser = offer.to_user_id;
              } else {
                try {
                  const userRes = await getUserById(toUserId);
                  if (userRes.success && userRes.data) {
                    toUser = userRes.data;
                  }
                } catch (error) {
                  console.error("Error fetching to user:", error);
                }
              }
            }
            
            // Determine which user is "me" and which is "other"
            if (fromUserId && String(fromUserId) === currentUserIdStr) {
              // Current user is the sender
              myUser = fromUser;
              otherUser = toUser;
            } else if (toUserId && String(toUserId) === currentUserIdStr) {
              // Current user is the receiver
              myUser = toUser;
              otherUser = fromUser;
            } else {
              // Current user is not in this offer, use to_user as otherUser for display
              otherUser = toUser || fromUser;
            }

            // Fetch items for this offer
            let myItems = [];
            let theirItems = [];
            try {
              const itemsRes = await getOfferItemsByOfferId(offer.id);
              if (itemsRes.success && itemsRes.data) {
                // Fetch product details for each item
                const itemPromises = itemsRes.data.map(async (item) => {
                  try {
                    const productRes = await getProductById(item.item_id);
                    if (productRes.success) {
                      return { ...item, product: productRes.data };
                    }
                  } catch (error) {
                    console.error("Error fetching product:", error);
                  }
                  return null;
                });
                
                const populatedItems = (await Promise.all(itemPromises)).filter(Boolean);
                
                // Categorize items based on which user offered them
                // Items are categorized by the 'offered_by' field which contains the user ID who offered the item
                // If current user is the sender: myItems = items offered by from_user_id, theirItems = items offered by to_user_id
                // If current user is the receiver: myItems = items offered by to_user_id, theirItems = items offered by from_user_id
                
                const fromUserIdStr = fromUserId ? String(fromUserId) : null;
                const toUserIdStr = toUserId ? String(toUserId) : null;
                
                if (fromUserIdStr && toUserIdStr) {
                  // Determine which user ID represents "my items"
                  let myUserIdForItems = null;
                  if (fromUserIdStr === currentUserIdStr) {
                    // Current user is the sender, so my items are those offered by from_user_id
                    myUserIdForItems = fromUserIdStr;
                  } else if (toUserIdStr === currentUserIdStr) {
                    // Current user is the receiver, so my items are those offered by to_user_id
                    myUserIdForItems = toUserIdStr;
                  }
                  
                  // Separate items by offered_by field
                  if (myUserIdForItems) {
                    myItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '');
                      return offeredBy === myUserIdForItems;
                    });
                    
                    theirItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '');
                      return offeredBy !== myUserIdForItems;
                    });
                  } else {
                    // Current user is not in this offer, categorize based on from/to structure
                    myItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '');
                      return offeredBy === fromUserIdStr;
                    });
                    
                    theirItems = populatedItems.filter(item => {
                      const offeredBy = String(item.offered_by || '');
                      return offeredBy === toUserIdStr;
                    });
                  }
                } else {
                  // Fallback: if user IDs are missing, put all items in theirItems
                  theirItems = populatedItems;
                  myItems = [];
                }
              }
            } catch (error) {
              console.error("Error fetching offer items:", error);
            }

            return {
              ...offer,
              fromUser,
              toUser,
              otherUser,
              myUser,
              myItems,
              theirItems,
            };
          })
        );

        setOffers(processedOffers);
        setFilteredOffers(processedOffers);
      } else {
        setOffers([]);
        setFilteredOffers([]);
      }
    } catch (error) {
      console.error("Error fetching offers:", error)
      setOffers([]);
      setFilteredOffers([]);
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    if (currentUserId) {
      fetchOffers()
    }
  }, [fetchOffers, currentUserId])

  // Apply filters
  useEffect(() => {
    let filtered = [...offers]

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status_offer === statusFilter)
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(offer => {
        // Search in fromUser (sender)
        const fromUserName = offer.fromUser 
          ? `${offer.fromUser.first_name || ""} ${offer.fromUser.last_name || ""}`.trim().toLowerCase() 
          : "";
        const fromUserEmail = offer.fromUser?.email?.toLowerCase() || "";
        const fromUserUsername = offer.fromUser?.username?.toLowerCase() || "";
        
        // Search in toUser (receiver)
        const toUserName = offer.toUser 
          ? `${offer.toUser.first_name || ""} ${offer.toUser.last_name || ""}`.trim().toLowerCase() 
          : "";
        const toUserEmail = offer.toUser?.email?.toLowerCase() || "";
        const toUserUsername = offer.toUser?.username?.toLowerCase() || "";
        
        // Search in otherUser
        const otherUserName = offer.otherUser 
          ? `${offer.otherUser.first_name || ""} ${offer.otherUser.last_name || ""}`.trim().toLowerCase() 
          : "";
        const otherUserEmail = offer.otherUser?.email?.toLowerCase() || "";
        const otherUserUsername = offer.otherUser?.username?.toLowerCase() || "";
        
        // Search in myUser
        const myUserName = offer.myUser 
          ? `${offer.myUser.first_name || ""} ${offer.myUser.last_name || ""}`.trim().toLowerCase() 
          : "";
        const myUserEmail = offer.myUser?.email?.toLowerCase() || "";
        const myUserUsername = offer.myUser?.username?.toLowerCase() || "";
        
        // Search in product names from myItems
        const myItemNames = (offer.myItems || [])
          .map(item => item.product?.name || "")
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        
        // Search in product names from theirItems
        const theirItemNames = (offer.theirItems || [])
          .map(item => item.product?.name || "")
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        
        // Search in offer ID
        const offerId = offer.id?.toLowerCase() || "";
        
        // Search in offer type
        const offerType = (offer.offerType || "").toLowerCase();
        
        // Check if search term matches any of the above
        return fromUserName.includes(searchLower) ||
               fromUserEmail.includes(searchLower) ||
               fromUserUsername.includes(searchLower) ||
               toUserName.includes(searchLower) ||
               toUserEmail.includes(searchLower) ||
               toUserUsername.includes(searchLower) ||
               otherUserName.includes(searchLower) ||
               otherUserEmail.includes(searchLower) ||
               otherUserUsername.includes(searchLower) ||
               myUserName.includes(searchLower) ||
               myUserEmail.includes(searchLower) ||
               myUserUsername.includes(searchLower) ||
               myItemNames.includes(searchLower) ||
               theirItemNames.includes(searchLower) ||
               offerId.includes(searchLower) ||
               offerType.includes(searchLower);
      });
    }

    if (dateFrom) {
      filtered = filtered.filter(offer => {
        const offerDate = new Date(offer.date_created || offer.date_updated)
        return offerDate >= new Date(dateFrom)
      })
    }
    if (dateTo) {
      filtered = filtered.filter(offer => {
        const offerDate = new Date(offer.date_created || offer.date_updated)
        const toDate = new Date(dateTo)
        toDate.setHours(23, 59, 59, 999)
        return offerDate <= toDate
      })
    }

    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.date_updated || a.date_created || 0) - new Date(b.date_updated || b.date_created || 0);
        case 'my_value_desc':
          return calculateTotalValue(b.myItems) - calculateTotalValue(a.myItems);
        case 'my_value_asc':
          return calculateTotalValue(a.myItems) - calculateTotalValue(b.myItems);
        case 'their_value_desc':
          return calculateTotalValue(b.theirItems) - calculateTotalValue(a.theirItems);
        case 'their_value_asc':
          return calculateTotalValue(a.theirItems) - calculateTotalValue(b.theirItems);
        case 'date_desc':
        default:
          return new Date(b.date_updated || b.date_created || 0) - new Date(a.date_updated || a.date_created || 0);
      }
    });

    setFilteredOffers(filtered)
  }, [offers, statusFilter, searchTerm, dateFrom, dateTo, sortOption])

  const toggleOfferExpansion = (offerId) => {
    setExpandedOffer(expandedOffer === offerId ? null : offerId)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: t("completed") || "Completed", className: "bg-green-500/10 text-green-600 dark:text-green-400", icon: CheckCircle2 },
      pending: { label: t("pending") || "Pending", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400", icon: Clock },
      accepted: { label: t("accepted") || "Accepted", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400", icon: CheckCircle2 },
      rejected: { label: t("rejected") || "Rejected", className: "bg-red-500/10 text-red-600 dark:text-red-400", icon: XCircle },
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString(isRTL ? "ar" : "en", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateTotalValue = (items = []) => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || 0)
      const quantity = parseInt(item.quantity || 1)
      return sum + (price * quantity)
    }, 0)
  }

  const handleExport = () => {
    const headers = [
      "Offer ID", "Date", "Status", "Type",
      "Other User", "My Items Value", "Their Items Value", "Cash Adjustment"
    ];

    const rows = filteredOffers.map(offer => [
      offer.id,
      formatDate(offer.date_created),
      offer.status_offer,
      offer.offerType,
      offer.otherUser ? `${offer.otherUser.first_name || ""} ${offer.otherUser.last_name || ""}`.trim() : "Unknown",
      calculateTotalValue(offer.myItems).toFixed(2),
      calculateTotalValue(offer.theirItems).toFixed(2),
      offer.cash_adjustment || 0
    ].join(','))

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "offers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">

        <SidebarInset className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex h-16 items-center gap-4 px-6">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-primary">{t("swaps") || "Swaps"}</h1>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("export") || "Export"}
                </Button>
                <Button size="sm"  onClick={()=>{router.push('/products')}}>
                  <Plus className="h-4 w-4 mr-2"/>
                  {t("addSwap") || "Add Swap"}
                </Button>
                <Button size="sm" onClick={()=>{setShowFilter(!showFilter)}}>               
                  {showFilter?(<ArrowBigUp className="h-4 w-4 mx-1" />):( <ArrowBigDown className="h-4 w-4 mx-1" />)}
                  {t("Filter") || "Filter"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-2 px-6 space-y-2">
            {
  showFilter && (   <div className="flex flex-col md:flex-row  gap-2">
    <div className="relative flex-1 ">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={t("searchOffers") || "user name, email "}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder={t("status") || "Status"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("allStatuses") || "All Statuses"}</SelectItem>
        <SelectItem value="completed">{t("completed") || "Completed"}</SelectItem>
        <SelectItem value="pending">{t("pending") || "Pending"}</SelectItem>
        <SelectItem value="accepted">{t("accepted") || "Accepted"}</SelectItem>
        <SelectItem value="rejected">{t("rejected") || "Rejected"}</SelectItem>
      </SelectContent>
    </Select>
    <Select value={sortOption} onValueChange={setSortOption}>
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="date_desc">{t("newestFirst")||"Newest First"}</SelectItem>
        <SelectItem value="date_asc">{t("oldestFirst")||"Oldest First"}</SelectItem>
        <SelectItem value="my_value_desc">{t("myValueDesc")||"My Offer Value (High to Low)"}</SelectItem>
        <SelectItem value="my_value_asc">{t("myValueAsc")||"My Offer Value (Low to High)"}</SelectItem>
        <SelectItem value="their_value_desc">{t("theirValueDesc")||"Their Offer Value (High to Low)"}</SelectItem>
        <SelectItem value="their_value_asc">{t("theirValueAsc")||"Their Offer Value (Low to High)"}</SelectItem>
      </SelectContent>
    </Select>
    <Input
      type="date"
      placeholder={t("from") || "From"}
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
      className="w-full md:w-[150px]"
    />
    <Input
      type="date"
      placeholder={t("to") || "To"}
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
      className="w-full md:w-[150px]"
    />
  </div>)

            }
          
          
          </div>

          <div className="px-6 pb-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">{t("loading") || "Loading..."}</p>
              </div>
            ) : filteredOffers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">{t("noOffersFound") || "No offers found"}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t("tryAdjustingFilters") || "Try adjusting your filters"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredOffers.map((offer) => {
                  return (
                    <motion.div key={offer.id} variants={itemVariants}>
                      <Card className="overflow-hidden">
                        <div>
                          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <Avatar>
                                <AvatarImage 
                                  src={
                                    offer.otherUser?.avatar 
                                      ? `${mediaURL}${offer.otherUser.avatar}` 
                                      : "/placeholder-user.jpg"
                                  } 
                                  alt={offer.otherUser ? `${offer.otherUser.first_name || ""} ${offer.otherUser.last_name || ""}`.trim() : "User"} 
                                />
                                <AvatarFallback>
                                  {(offer.otherUser?.first_name?.[0] || offer.otherUser?.last_name?.[0] || offer.otherUser?.email?.[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-base font-semibold">
                                    {t('offerWith') || "Offer with"} {offer.otherUser ? `${offer.otherUser.first_name || ""} ${offer.otherUser.last_name || ""}`.trim() || offer.otherUser.email || "Unknown" : "Unknown"}
                                </CardTitle>
                                <div className="flex flex-col gap-1 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    {(() => {
                                      if (offer.fromUser && offer.myUser && offer.fromUser.id === offer.myUser.id) {
                                        return `${t("youAreSender") || "You are the sender"} • ${offer.toUser ? `${offer.toUser.first_name || ""} ${offer.toUser.last_name || ""}`.trim() : "Unknown"} ${t("isReceiver") || "is the receiver"}`;
                                      } else if (offer.toUser && offer.myUser && offer.toUser.id === offer.myUser.id) {
                                        return `${offer.fromUser ? `${offer.fromUser.first_name || ""} ${offer.fromUser.last_name || ""}`.trim() : "Unknown"} ${t("isSender") || "is the sender"} • ${t("youAreReceiver") || "You are the receiver"}`;
                                      } else {
                                        const fromName = offer.fromUser ? `${offer.fromUser.first_name || ""} ${offer.fromUser.last_name || ""}`.trim() : "Sender";
                                        const toName = offer.toUser ? `${offer.toUser.first_name || ""} ${offer.toUser.last_name || ""}`.trim() : "Receiver";
                                        return `${fromName} → ${toName}`;
                                      }
                                    })()}
                                  </p>
                                 
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {getStatusBadge(offer.status_offer)}
                                {
                                  offer.status_offer!="rejected"?(<Button variant="ghost" size="sm" className="h-7" onClick={() => toggleOfferExpansion(offer.id)}>
                                  {expandedOffer === offer.id ? t('hide') || 'Hide' : t('view') || 'View'}
                              </Button>):null
                                }
                                
                            </div>
                          </CardHeader>
                          <CardContent>
                          {

offer.status_offer!="rejected" ? (  <div className="space-y-3">
                              <div className="flex justify-between items-center text-sm p-2 bg-primary/5 rounded-md">
                                <div>
                                  <div className="font-medium">{t('myOffer') || "My Offer"}</div>
                                  {offer.myUser && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {offer.myUser.first_name || ""} {offer.myUser.last_name || ""} {offer.myUser.email ? `(${offer.myUser.email})` : ""}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-primary">{calculateTotalValue(offer.myItems || []).toFixed(2)} {t('egp') || "EGP"}</div>
                                  <div className="text-xs text-muted-foreground">{offer.myItems?.length || 0} {t('items') || "items"}</div>
                                </div>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center text-sm p-2 bg-secondary/5 rounded-md">
                                <div>
                                  <div className="font-medium">{t('theirOffer') || "Their Offer"}</div>
                                  {offer.otherUser && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      {offer.otherUser.first_name || ""} {offer.otherUser.last_name || ""} {offer.otherUser.email ? `(${offer.otherUser.email})` : ""}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-primary">{calculateTotalValue(offer.theirItems || []).toFixed(2)} {t('egp') || "EGP"}</div>
                                  <div className="text-xs text-muted-foreground">{offer.theirItems?.length || 0} {t('items') || "items"}</div>
                                </div>
                              </div>
                            </div>):null
                          }
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center text-sm">
                              <div className="font-medium">{t('cashAdjustment') || "Cash Adjustment"}</div>
                              <div className={`font-semibold ${
                                offer.cash_adjustment === 0 || offer.cash_adjustment === null || offer.cash_adjustment === undefined
                                  ? 'text-muted-foreground'
                                  : offer.cash_adjustment > 0 
                                    ? 'text-green-500' 
                                    : 'text-red-500'
                              }`}>
                                {offer.cash_adjustment === 0 || offer.cash_adjustment === null || offer.cash_adjustment === undefined
                                  ? (t('equalSwap') || "Equal Swap")
                                  : `${offer.cash_adjustment.toFixed(2)} ${t('le') || "EGP"}`
                                }
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-4 text-right">
                              {formatDate(offer.date_updated || offer.date_created)}
                            </div>
                          </CardContent>
                        </div>
                        <AnimatePresence>
                          {expandedOffer === offer.id && (
                            <motion.section
                              key="content"
                              initial="collapsed"
                              animate="open"
                              exit="collapsed"
                              variants={{
                                open: { opacity: 1, height: "auto" },
                                collapsed: { opacity: 0, height: 0 },
                              }}
                              transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                            >
                              <ExpandedOfferView offer={offer} currentUserId={currentUserId} t={t} isRTL={isRTL} />
                            </motion.section>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
