"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Post } from "@/types"

export function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const country = searchParams.get("country")
  const username = searchParams.get("username")
  const sort = searchParams.get("sort") || "newest"

  useEffect(() => {
    setPage(1)
    setPosts([])
    setHasMore(true)
    fetchPosts(1)
  }, [country, username, sort])

  const fetchPosts = async (pageNum: number) => {
    try {
      setIsLoading(true)

      let url = `/posts?page=${pageNum}&limit=10`

      if (country) {
        url += `&country=${country}`
      }

      if (username) {
        url += `&username=${username}`
      }

      // Note: The API doesn't support sorting directly, but we can implement client-side sorting

      const response = await apiClient.get(url)

      if (response.data.length === 0) {
        setHasMore(false)
      } else {
        // Apply client-side sorting if needed
        const sortedData = [...response.data]
        if (sort === "most-liked") {
          sortedData.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        }

        setPosts((prevPosts) => (pageNum === 1 ? sortedData : [...prevPosts, ...sortedData]))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch posts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  return (
    <div className="space-y-6 mt-6">
      {posts.length === 0 && !isLoading ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl font-medium mb-2">No posts found</h2>
          <p className="text-muted-foreground mb-4">
            {country
              ? `No posts found for country: ${country}`
              : username
                ? `No posts found from user: @${username}`
                : "No posts available"}
          </p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onUpdate={() => fetchPosts(1)} />
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
        </>
      )}
    </div>
  )
}
