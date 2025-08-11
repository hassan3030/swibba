"use client"

import { useState } from 'react'
import { useLanguage } from '@/lib/language-provider'
import { useTranslations } from '@/lib/use-translations'
import RTLWrapper from '@/components/rtl-wrapper'
import RTLIcon from '@/components/rtl-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  User, 
  Settings,
  MessageCircle,
  Heart,
  Star
} from 'lucide-react'

export default function RTLDemoPage() {
  const { language, toggleLanguage, isRTL } = useLanguage()
  const { t } = useTranslations()
  const [inputValue, setInputValue] = useState('')

  const demoText = {
    en: {
      title: "RTL Design Demonstration",
      subtitle: "This page demonstrates how the application handles Right-to-Left (RTL) text direction for Arabic content",
      description: "Toggle between English and Arabic to see how the layout, text alignment, margins, and icons automatically adjust.",
      navigation: "Navigation Menu",
      content: "Main Content Area",
      sidebar: "Sidebar",
      form: "Form Elements",
      buttons: "Buttons and Actions",
      cards: "Card Components",
      lists: "Lists and Items"
    },
    ar: {
      title: "عرض تصميم RTL",
      subtitle: "تعرض هذه الصفحة كيفية تعامل التطبيق مع اتجاه النص من اليمين إلى اليسار للمحتوى العربي",
      description: "بدّل بين الإنجليزية والعربية لترى كيف يتكيف التخطيط ومحاذاة النص والهوامش والأيقونات تلقائياً.",
      navigation: "قائمة التنقل",
      content: "منطقة المحتوى الرئيسي",
      sidebar: "الشريط الجانبي",
      form: "عناصر النموذج",
      buttons: "الأزرار والإجراءات",
      cards: "مكونات البطاقات",
      lists: "القوائم والعناصر"
    }
  }

  const currentText = demoText[language] || demoText.en

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <RTLIcon flipInRTL>
                <Home className="h-6 w-6" />
              </RTLIcon>
              <h1 className="text-xl font-bold">{currentText.title}</h1>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Badge variant="outline" className="rtl-numbers">
                {language.toUpperCase()}
              </Badge>
              <Button onClick={toggleLanguage} variant="outline" size="sm">
                {language === 'en' ? 'العربية' : 'English'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <RTLWrapper className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">{currentText.subtitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">{currentText.description}</p>
            </CardContent>
          </Card>
        </RTLWrapper>

        {/* Demo Sections */}
        <Tabs defaultValue="layout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">{currentText.navigation}</TabsTrigger>
            <TabsTrigger value="form">{currentText.form}</TabsTrigger>
            <TabsTrigger value="components">{currentText.cards}</TabsTrigger>
            <TabsTrigger value="lists">{currentText.lists}</TabsTrigger>
          </TabsList>

          {/* Layout Demo */}
          <TabsContent value="layout" className="space-y-6">
            <RTLWrapper>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
                      <RTLIcon flipInRTL>
                        <Settings className="h-5 w-5" />
                      </RTLIcon>
                      <span>{currentText.sidebar}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-muted rounded">
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-muted rounded">
                      <MessageCircle className="h-4 w-4" />
                      <span>Messages</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 hover:bg-muted rounded">
                      <Heart className="h-4 w-4" />
                      <span>Favorites</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Content */}
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>{currentText.content}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Item 1</span>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <RTLIcon flipInRTL>
                            <ChevronLeft className="h-4 w-4" />
                          </RTLIcon>
                          <span>Details</span>
                          <RTLIcon flipInRTL>
                            <ChevronRight className="h-4 w-4" />
                          </RTLIcon>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Item 2</span>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <RTLIcon flipInRTL>
                            <ChevronLeft className="h-4 w-4" />
                          </RTLIcon>
                          <span>Details</span>
                          <RTLIcon flipInRTL>
                            <ChevronRight className="h-4 w-4" />
                          </RTLIcon>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RTLWrapper>
          </TabsContent>

          {/* Form Demo */}
          <TabsContent value="form" className="space-y-6">
            <RTLWrapper>
              <Card>
                <CardHeader>
                  <CardTitle>{currentText.form}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input 
                        placeholder="Enter your name" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email" 
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea 
                      className="w-full p-3 border rounded-md resize-none"
                      rows={4}
                      placeholder="Enter your message"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <input type="checkbox" id="agree" />
                      <label htmlFor="agree" className="text-sm">
                        I agree to the terms and conditions
                      </label>
                    </div>
                    <Button>Submit</Button>
                  </div>
                </CardContent>
              </Card>
            </RTLWrapper>
          </TabsContent>

          {/* Components Demo */}
          <TabsContent value="components" className="space-y-6">
            <RTLWrapper>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((item) => (
                  <Card key={item} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Card {item}</CardTitle>
                        <RTLIcon flipInRTL>
                          <Star className="h-5 w-5 text-yellow-500" />
                        </RTLIcon>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        This is a sample card component that demonstrates RTL layout support.
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Tag {item}</Badge>
                        <Button size="sm">Action</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </RTLWrapper>
          </TabsContent>

          {/* Lists Demo */}
          <TabsContent value="lists" className="space-y-6">
            <RTLWrapper>
              <Card>
                <CardHeader>
                  <CardTitle>{currentText.lists}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Numbered List */}
                    <div>
                      <h3 className="font-semibold mb-2">Numbered List:</h3>
                      <ol className="list-decimal list-inside space-y-1 rtl-numbers">
                        <li>First item in the list</li>
                        <li>Second item with more content</li>
                        <li>Third item with a button <Button size="sm" className="ml-2 rtl:ml-0 rtl:mr-2">Action</Button></li>
                      </ol>
                    </div>

                    {/* Bullet List */}
                    <div>
                      <h3 className="font-semibold mb-2">Bullet List:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Unordered list item one</li>
                        <li>Unordered list item two</li>
                        <li>Unordered list item three</li>
                      </ul>
                    </div>

                    {/* Navigation List */}
                    <div>
                      <h3 className="font-semibold mb-2">Navigation List:</h3>
                      <nav className="space-y-2">
                        {['Home', 'Products', 'About', 'Contact'].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                            <span>{item}</span>
                            <RTLIcon flipInRTL>
                              <ArrowRight className="h-4 w-4" />
                            </RTLIcon>
                          </div>
                        ))}
                      </nav>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RTLWrapper>
          </TabsContent>
        </Tabs>

        {/* RTL Status */}
        <RTLWrapper className="mt-8">
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Current Language</div>
                  <div className="font-semibold">{language === 'en' ? 'English' : 'العربية'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Text Direction</div>
                  <div className="font-semibold">{isRTL ? 'RTL' : 'LTR'}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Font Family</div>
                  <div className="font-semibold">Cairo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </RTLWrapper>
      </main>
    </div>
  )
}
