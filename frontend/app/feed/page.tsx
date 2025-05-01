"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { apiClient } from "@/lib/api-client"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Post } from "@/types"

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    fetchFeed()
  }, [isAuthenticated, page, router])

  const fetchFeed = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/feed?page=${page}&limit=10`)

      if (response.data.length === 0) {
        setHasMore(false)
      } else {
        setPosts((prevPosts) => (page === 1 ? response.data : [...prevPosts, ...response.data]))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Feed</h1>

      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No posts in your feed yet</h2>
          <p className="text-muted-foreground mb-6">Follow other users to see their posts here</p>
          <Button onClick={() => router.push("/")}>Explore Posts</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={fetchFeed} />
          ))}

          {isLoading && (
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="border rounded-lg p-6 space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-24 w-full" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                ))}
            </div>
          )}

          {hasMore && !isLoading && (
            <div className="flex justify-center mt-8">
              <Button onClick={loadMore} variant="outline">
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
