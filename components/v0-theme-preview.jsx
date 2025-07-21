"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Moon, Sun, Code, Terminal, MessageSquare, Settings, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

export function V0ThemePreview() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">v0-Inspired Theme</h2>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Color Palette</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-background"></div>
              <div>
                <p className="text-sm font-medium">Background</p>
                <p className="text-xs text-muted-foreground">{isDark ? "#171717" : "#FFFFFF"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-card"></div>
              <div>
                <p className="text-sm font-medium">Card</p>
                <p className="text-xs text-muted-foreground">{isDark ? "#212121" : "#FFFFFF"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary"></div>
              <div>
                <p className="text-sm font-medium">Primary</p>
                <p className="text-xs text-muted-foreground">{isDark ? "#3291FF" : "#F1C232"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-muted"></div>
              <div>
                <p className="text-sm font-medium">Muted</p>
                <p className="text-xs text-muted-foreground">{isDark ? "#262626" : "#F1F5F9"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: isDark ? "#2e2e2e" : "#E2E8F0" }}
              ></div>
              <div>
                <p className="text-sm font-medium">Border</p>
                <p className="text-xs text-muted-foreground">{isDark ? "#2E2E2E" : "#E2E8F0"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-2">UI Components</h3>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>v0 Card Example</CardTitle>
                <CardDescription>This card uses the v0-inspired theme colors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="Input example" />
                  <div className="flex gap-2">
                    <Button>Primary</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Save</Button>
              </CardFooter>
            </Card>

            <Tabs defaultValue="code">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="terminal">
                  <Terminal className="h-4 w-4 mr-2" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="chat">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>
              <TabsContent value="code" className="p-4 border rounded-md mt-2 min-h-[100px] bg-muted">
                <pre className="text-sm">
                  <code>{`function hello() {
  console.log("Hello, v0!");
}`}</code>
                </pre>
              </TabsContent>
              <TabsContent value="terminal" className="p-4 border rounded-md mt-2 min-h-[100px] bg-muted">
                <pre className="text-sm text-muted-foreground">
                  <code>{`$ npm install
$ npm run dev
Ready on http://localhost:3000`}</code>
                </pre>
              </TabsContent>
              <TabsContent value="chat" className="p-4 border rounded-md mt-2 min-h-[100px] bg-muted">
                <div className="space-y-2">
                  <div className="p-2 rounded-md bg-card max-w-[80%]">
                    <p className="text-sm">How can I implement dark mode?</p>
                  </div>
                  <div className="p-2 rounded-md bg-primary text-primary-foreground max-w-[80%] ml-auto">
                    <p className="text-sm">You can use the next-themes package with Tailwind CSS.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Navigation Example</h3>
        <div className="border rounded-md overflow-hidden">
          <div className="bg-card p-4 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Settings</span>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="bg-background p-4 flex items-center justify-between border-b hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <span>Developer</span>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="bg-background p-4 flex items-center justify-between hover:bg-muted transition-colors">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Feedback</span>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
