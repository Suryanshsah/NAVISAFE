"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"

interface AuthorityLoginProps {
  onLogin: () => void
  onBack: () => void
}

export function AuthorityLogin({ onLogin, onBack }: AuthorityLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Hardcoded credentials: admin/admin
    if (username === "admin" && password === "admin") {
      // Store authority auth flag in localStorage
      localStorage.setItem("authorityAuth", "true")
      onLogin()
    } else {
      setError("Invalid username or password. Please try admin/admin.")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Card className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500 shadow-2xl border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/20 rounded-full ring-2 ring-primary/30">
              <Shield className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Authority Access</CardTitle>
          <p className="text-sm text-slate-300">
            Please enter your credentials to access the Authority Dashboard
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-lg animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="username" className="text-slate-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:ring-primary focus:border-primary pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600/50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Access Dashboard
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full h-12 text-base border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                ← Back to Welcome
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-300">
                <p className="font-medium">Demo Credentials:</p>
                <p>Username: admin</p>
                <p>Password: admin</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
