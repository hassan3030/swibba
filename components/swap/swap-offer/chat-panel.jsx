"use client"
import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  MessageCircle, 
  Send, 
  X, 
  Loader2,
  CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { mediaURL } from "@/callAPI/utiles"

// Group messages by date
const groupMessagesByDate = (messages, isRTL) => {
  const groups = {}
  messages.forEach(msg => {
    const date = new Date(msg.date_created).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(msg)
  })
  return groups
}

// Format time for messages
const formatMessageTime = (date, isRTL) => {
  return new Date(date).toLocaleString(isRTL ? 'ar-EG' : 'en-US', {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
}

// Check if today
const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// Check if yesterday
const isYesterday = (dateString) => {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

// Get display date
const getDisplayDate = (dateString, t, isRTL) => {
  // Parse the original date from message
  const originalDate = new Date(dateString)
  if (isToday(originalDate)) return t("Today") || "Today"
  if (isYesterday(originalDate)) return t("Yesterday") || "Yesterday"
  return dateString
}

export function ChatPanel({ 
  isOpen, 
  onClose, 
  messages, 
  myUserId, 
  onSendMessage, 
  message, 
  setMessage, 
  isSending, 
  otherUser, 
  t, 
  isRTL 
}) {
  const scrollRef = useRef(null)
  const textareaRef = useRef(null)
  const [isOnline] = useState(true) // Could be dynamic based on user status

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      setTimeout(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 100)
    }
  }, [messages, isOpen])

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setMessage(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.date_created) - new Date(b.date_created)
  )
  const groupedMessages = groupMessagesByDate(sortedMessages, isRTL)

  const userName = `${otherUser?.first_name || ""} ${otherUser?.last_name || ""}`.trim() || t("User") || "User"
  const userLocation = otherUser?.city || otherUser?.country || t("NoLocation") || ""

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Only visible on desktop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000001] hidden md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Chat Panel */}
          <motion.div
            dir={isRTL ? "rtl" : "ltr"}
            className={`fixed z-[10000002] bg-background flex flex-col overflow-hidden
              inset-0
              md:inset-y-0 md:w-[420px] md:shadow-2xl
              lg:w-[480px]
              xl:w-[520px]
              ${isRTL ? 'md:left-0 md:right-auto md:border-r' : 'md:right-0 md:left-auto md:border-l'} md:border-border`}
            initial={{ x: isRTL ? "-100%" : "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isRTL ? "-100%" : "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header - Close on left, Name+Location and Avatar on right */}
            <div className="flex items-center justify-between px-3 py-3 md:px-4 md:py-4 bg-primary text-primary-foreground shrink-0 shadow-md">
              {/* Close button - Always on left */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="rounded-full shrink-0 text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* User info + Avatar - Always on right */}
              <div className="flex items-center gap-3">
                {/* Name and Location - Right aligned */}
                <div className="text-right">
                  <h3 className="font-semibold text-base md:text-lg truncate max-w-[180px]">
                    {userName}
                  </h3>
                  {userLocation && (
                    <p className="text-xs md:text-sm text-primary-foreground/70 truncate max-w-[180px]">
                      {userLocation}
                    </p>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-10 w-10 md:h-11 md:w-11 border-2 border-primary-foreground/20">
                    <AvatarImage src={`${mediaURL}${otherUser?.avatar}`} />
                    <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-bold text-lg">
                      {otherUser?.first_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-primary" />
                  )}
                </div>
              </div>
            </div>

            {/* Messages area with chat background pattern */}
            <div 
              className="flex-1 overflow-y-auto bg-muted/30 dark:bg-muted/10" 
              ref={scrollRef}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              <div className="px-3 py-4 md:px-4 md:py-6 min-h-full flex flex-col">
                {messages.length === 0 ? (
                  /* Empty state */
                  <div className="flex-1 flex flex-col items-center justify-center py-12">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <MessageCircle className="h-10 w-10 md:h-12 md:w-12 text-primary/40" />
                    </div>
                    <h4 className="text-lg font-medium text-foreground mb-2">
                      {t("NoMessagesYet") || "No messages yet"}
                    </h4>
                    <p className="text-sm text-muted-foreground text-center max-w-[250px]">
                      {t("StartConversation") || "Start the conversation!"} 
                    </p>
                  </div>
                ) : (
                  /* Messages grouped by date */
                  <div className="space-y-4 md:space-y-6">
                    {Object.entries(groupedMessages).map(([date, msgs]) => (
                      <div key={date}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center mb-4">
                          <span className="px-3 py-1 bg-muted/80 dark:bg-muted/50 rounded-full text-xs font-medium text-muted-foreground shadow-sm">
                            {getDisplayDate(date, t, isRTL)}
                          </span>
                        </div>

                        {/* Messages for this date */}
                        <div className="space-y-1">
                          {msgs.map((msg, index) => {
                            const isMe = msg.from_user_id === myUserId
                            const showAvatar = !isMe && (index === 0 || msgs[index - 1]?.from_user_id === myUserId)
                            
                            return (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex items-end gap-2 ${isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                              >
                                {/* Avatar for other user - show on correct side based on RTL */}
                                {!isMe && !isRTL && (
                                  <div className="w-8 shrink-0">
                                    {showAvatar && (
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={`${mediaURL}${otherUser?.avatar}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                          {otherUser?.first_name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                )}

                                {/* Message bubble */}
                                <div
                                  className={`relative max-w-[75%] md:max-w-[65%] px-3 py-2 md:px-4 md:py-2.5 shadow-sm
                                    ${isMe 
                                      ? `bg-primary text-primary-foreground rounded-2xl ${isRTL ? 'rounded-bl-md' : 'rounded-br-md'}` 
                                      : `bg-background dark:bg-card rounded-2xl ${isRTL ? 'rounded-br-md' : 'rounded-bl-md'} border border-border/50`
                                    }`}
                                >
                                  {/* Message text */}
                                  <p className="text-sm md:text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                                    {msg.message}
                                  </p>
                                  
                                  {/* Time and status */}
                                  <div className={`flex items-center gap-1 mt-1 ${isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
                                    <span className={`text-[10px] md:text-[11px] ${
                                      isMe ? "text-primary-foreground/60" : "text-muted-foreground"
                                    }`}>
                                      {formatMessageTime(msg.date_created, isRTL)}
                                    </span>
                                    {isMe && (
                                      <CheckCheck className={`h-3.5 w-3.5 ${
                                        msg.read ? "text-blue-400" : "text-primary-foreground/50"
                                      }`} />
                                    )}
                                  </div>
                                </div>

                                {/* Avatar for other user in RTL */}
                                {!isMe && isRTL && (
                                  <div className="w-8 shrink-0">
                                    {showAvatar && (
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={`${mediaURL}${otherUser?.avatar}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                          {otherUser?.first_name?.[0]?.toUpperCase() || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                  </div>
                                )}
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Input area - Clean design without emoji button */}
            <div className="p-2 md:p-3 bg-background border-t border-border shrink-0 safe-area-inset-bottom">
              <div className="flex items-end gap-2 max-w-4xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
                {/* Input container */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    dir={isRTL ? "rtl" : "ltr"}
                    placeholder={t("TypeMessage") || "Type a message..."}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className="min-h-[44px] max-h-[120px] py-3 px-4 rounded-3xl bg-muted/50 border-0 resize-none focus-visible:ring-1 focus-visible:ring-primary text-sm md:text-base placeholder:text-muted-foreground"
                    style={{ textAlign: isRTL ? 'right' : 'left' }}
                    disabled={isSending}
                    rows={1}
                  />
                </div>

                {/* Send button */}
                <Button
                  onClick={() => {
                    onSendMessage()
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto'
                    }
                  }}
                  size="icon"
                  disabled={!message.trim() || isSending}
                  className="h-11 w-11 md:h-12 md:w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className={`h-5 w-5 `} />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ChatPanel
