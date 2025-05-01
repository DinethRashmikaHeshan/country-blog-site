"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { PostCard } from "@/components/post-card"
import { UserCard } from "@/components/user-card"
import type { Post, User } from "@/types"
import { UserPlus, UserMinus, Mail } from "lucide-react"

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const { isAuthenticated, user: currentUser } = useAuth()
  const { toast } = useToast()

  const isCurrentUser = currentUser?.id === Number(id)

  useEffect(() => {
    fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    setIsLoading(true)

    try {
      // Fetch user details
      // Note: This endpoint is not specified in the requirements, so we're assuming it exists
      // In a real implementation, you would adjust this based on the actual API
      const userResponse = await apiClient.get(`/users/${id}`)
      setUser(userResponse.data)

      // Fetch user's posts
      const postsResponse = await apiClient.get(`/posts?username=${userResponse.data.username}`)
      setPosts(postsResponse.data)

      // Fetch followers
      const followersResponse = await apiClient.get(`/users/${id}/followers`)
      setFollowers(followersResponse.data)

      // Fetch following
      const followingResponse = await apiClient.get(`/users/${id}/following`)
      setFollowing(followingResponse.data)

      // Check if current user is following this user
      if (isAuthenticated && !isCurrentUser) {
        const isFollowingResponse = await apiClient.get(`/users/${currentUser?.id}/following`)
        const isFollowingUser = isFollowingResponse.data.some((u: User) => u.id === Number(id))
        setIsFollowing(isFollowingUser)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to follow users",
        variant: "destructive",
      })
      return
    }

    setIsFollowLoading(true)

    try {
      await apiClient.post(`/follow/${id}`)
      setIsFollowing(true)
      setFollowers((prev) => [...prev, currentUser as User])

      toast({
        title: "Success",
        description: `You are now following ${user?.username}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to follow user",
        variant: "destructive",
      })
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    if (!isAuthenticated) return

    setIsFollowLoading(true)

    try {
      await apiClient.delete(`/unfollow/${id}`)
      setIsFollowing(false)
      setFollowers((prev) => prev.filter((f) => f.id !== currentUser?.id))

      toast({
        title: "Success",
        description: `You have unfollowed ${user?.username}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to unfollow user",
        variant: "destructive",
      })
    } finally {
      setIsFollowLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-60" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          <Skeleton className="h-12 w-full mb-6" />

          <div className="space-y-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex items-center justify-center h-24 w-24 rounded-full bg-primary/10 text-primary text-3xl font-bold">
            {user.username[0].toUpperCase()}
          </div>

          <div className="space-y-2 flex-1">
            <h1 className="text-3xl font-bold">{user.username}</h1>

            <div className="flex items-center text-muted-foreground">
              <Mail className="h-4 w-4 mr-1" />
              <span>{user.email}</span>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="text-sm">
                <span className="font-bold">{posts.length}</span> posts
              </div>
              <div className="text-sm">
                <span className="font-bold">{followers.length}</span> followers
              </div>
              <div className="text-sm">
                <span className="font-bold">{following.length}</span> following
              </div>
            </div>

            {!isCurrentUser && isAuthenticated && (
              <div className="mt-4">
                {isFollowing ? (
                  <Button variant="outline" onClick={handleUnfollow} disabled={isFollowLoading}>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </Button>
                ) : (
                  <Button onClick={handleFollow} disabled={isFollowLoading}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-2">No posts yet</h2>
                <p className="text-muted-foreground">
                  {isCurrentUser ? "You haven't" : `${user.username} hasn't`} created any posts yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onUpdate={fetchUserData} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            {followers.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-2">No followers yet</h2>
                <p className="text-muted-foreground">
                  {isCurrentUser ? "You don't" : `${user.username} doesn't`} have any followers yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followers.map((follower) => (
                  <UserCard key={follower.id} user={follower} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {following.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-medium mb-2">Not following anyone</h2>
                <p className="text-muted-foreground">
                  {isCurrentUser ? "You're" : `${user.username} is`} not following anyone yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {following.map((followedUser) => (
                  <UserCard key={followedUser.id} user={followedUser} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
