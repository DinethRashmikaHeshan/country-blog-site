"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { useCountries } from "@/context/country-context"
import { apiClient } from "@/lib/api-client"
import { formatDate, truncateText } from "@/lib/utils"
import type { Post } from "@/types"
import { ThumbsUp, ThumbsDown, MessageSquare, Calendar, MapPin, Edit, Trash2 } from "lucide-react"
import { CountryInfo } from "@/components/country-info"

interface PostCardProps {
  post: Post
  onUpdate?: () => void
}

export function PostCard({ post, onUpdate }: PostCardProps) {
  const [isLikeLoading, setIsLikeLoading] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)
  const [dislikes, setDislikes] = useState(post.dislikes || 0)

  const { isAuthenticated, user } = useAuth()
  const { getCountryByName } = useCountries()
  const router = useRouter()
  const { toast } = useToast()

  const isOwner = isAuthenticated && user?.id === post.user_id
  const countryInfo = getCountryByName(post.country)

  const handleLike = async (isLike: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like or dislike posts",
        variant: "destructive",
      })
      return
    }

    setIsLikeLoading(true)

    try {
      const response = await apiClient.post(`/posts/${post.id}/like`, { isLike })
      setLikes(response.data.likes)
      setDislikes(response.data.dislikes)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record like/dislike",
        variant: "destructive",
      })
    } finally {
      setIsLikeLoading(false)
    }
  }

  const handleDeletePost = async () => {
    try {
      await apiClient.delete(`/posts/${post.id}`)
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
      if (onUpdate) {
        onUpdate()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarFallback>{post.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/users/${post.user_id}`} className="font-medium hover:underline">
                {post.username}
              </Link>
              <p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {isOwner && (
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => router.push(`/posts/${post.id}/edit`)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
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
        </div>

        <Link href={`/posts/${post.id}`}>
          <CardTitle className="text-xl mt-2 hover:underline">{post.title}</CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{post.country}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Visited: {formatDate(post.visit_date)}</span>
          </div>
        </div>

        <Link href={`/posts/${post.id}`}>
          <p className="text-muted-foreground mb-4">{truncateText(post.content, 200)}</p>
        </Link>

        {countryInfo && (
          <div className="mt-4 mb-2">
            <CountryInfo country={countryInfo} compact />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => handleLike(true)}
            disabled={isLikeLoading || !isAuthenticated}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            {likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => handleLike(false)}
            disabled={isLikeLoading || !isAuthenticated}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            {dislikes}
          </Button>
        </div>

        <Link href={`/posts/${post.id}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4 mr-1" />
            View Comments
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
