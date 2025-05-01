"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/context/auth-context"
import { useCountries } from "@/context/country-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageSquare, Edit, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Post, Comment } from "@/types"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CountryInfo } from "@/components/country-info"

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const { getCountryByName } = useCountries()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get(`/posts/${id}`)
      setPost(response.data)

      // Fetch comments for this post
      // Note: This endpoint is not specified in the requirements, so we're assuming it exists
      // In a real implementation, you would adjust this based on the actual API
      try {
        const commentsResponse = await apiClient.get(`/posts/${id}/comments`)
        setComments(commentsResponse.data || [])
      } catch (error) {
        console.error("Failed to fetch comments", error)
        setComments([])
      }
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

  const handleLike = async (isLike: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like or dislike posts",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.post(`/posts/${id}/like`, { isLike })
      setPost((prev) => {
        if (!prev) return null
        return {
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
        }
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record like/dislike",
        variant: "destructive",
      })
    }
  }

  const handleUnlike = async () => {
    if (!isAuthenticated) return

    try {
      const response = await apiClient.delete(`/posts/${id}/unlike`)
      setPost((prev) => {
        if (!prev) return null
        return {
          ...prev,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
        }
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove like/dislike",
        variant: "destructive",
      })
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment on posts",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) return

    setIsSubmittingComment(true)

    try {
      const response = await apiClient.post("/comments", {
        postId: Number(id),
        content: newComment,
      })

      // Add the new comment to the list
      // In a real implementation, you would get the full comment object from the response
      const newCommentObj: Comment = {
        id: response.data.commentId,
        post_id: Number(id),
        user_id: user?.id || 0,
        content: newComment,
        created_at: new Date().toISOString(),
        username: user?.username || "Anonymous",
      }

      setComments((prev) => [newCommentObj, ...prev])
      setNewComment("")

      toast({
        title: "Success",
        description: "Comment added successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeletePost = async () => {
    try {
      await apiClient.delete(`/posts/${id}`)
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-64 w-full mb-6" />
          <div className="flex space-x-4 mb-8">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  const isOwner = isAuthenticated && user?.id === post.user_id
  const countryInfo = getCountryByName(post.country)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div className="flex items-center space-x-2 mb-2 md:mb-0">
              <Avatar>
                <AvatarFallback>{post.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/users/${post.user_id}`} className="font-medium hover:underline">
                  {post.username}
                </Link>
                <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
              </div>
            </div>

            {countryInfo && <CountryInfo country={countryInfo} />}
          </div>

          {isOwner && (
            <div className="flex space-x-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => router.push(`/posts/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(true)}
                disabled={!isAuthenticated}
                className={isAuthenticated ? "" : "cursor-not-allowed"}
              >
                <ThumbsUp className="h-5 w-5 mr-1" />
                {post.likes || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(false)}
                disabled={!isAuthenticated}
                className={isAuthenticated ? "" : "cursor-not-allowed"}
              >
                <ThumbsDown className="h-5 w-5 mr-1" />
                {post.dislikes || 0}
              </Button>
            </div>

            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-1" />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Comments</h2>

          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="mb-2"
                disabled={isSubmittingComment}
              />
              <Button type="submit" disabled={isSubmittingComment || !newComment.trim()}>
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <div className="bg-muted p-4 rounded-lg mb-6">
              <p className="text-center">
                Please{" "}
                <Link href="/login" className="text-primary hover:underline">
                  log in
                </Link>{" "}
                to comment on this post.
              </p>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar>
                      <AvatarFallback>{comment.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/users/${comment.user_id}`} className="font-medium hover:underline">
                        {comment.username}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
