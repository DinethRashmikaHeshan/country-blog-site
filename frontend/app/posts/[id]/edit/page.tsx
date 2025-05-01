"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { useCountries } from "@/context/country-context"
import { apiClient } from "@/lib/api-client"
import type { Post } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [country, setCountry] = useState("")
  const [visitDate, setVisitDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { isAuthenticated, user } = useAuth()
  const { countries, isLoading: isLoadingCountries } = useCountries()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    console.log("data",isAuthenticated,user)
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchPost()
  }, [isAuthenticated, id, router])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/posts/${id}`)
      const postData = response.data

      // Check if the user is the owner of the post
      if (user?.id !== postData.user_id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own posts",
          variant: "destructive",
        })
        router.push(`/posts/${id}`)
        return
      }

      setPost(postData)
      setTitle(postData.title)
      setContent(postData.content)
      setCountry(postData.country)
      setVisitDate(postData.visit_date.split("T")[0]) // Format date to YYYY-MM-DD
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch post details",
        variant: "destructive",
      })
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !content || !country || !visitDate) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await apiClient.put(`/posts/${id}`, {
        title,
        content,
        country,
        visit_date: visitDate,
      })

      toast({
        title: "Success",
        description: "Post updated successfully",
      })

      router.push(`/posts/${id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Post</CardTitle>
          <CardDescription>Update your travel experience</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Amazing Trip to..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">
                  Country
                </label>
                <Select value={country} onValueChange={setCountry} disabled={isLoadingCountries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="visitDate" className="text-sm font-medium">
                  Visit Date
                </label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience..."
                className="min-h-[200px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/posts/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
