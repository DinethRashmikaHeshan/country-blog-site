import { PostList } from "@/components/post-list"
import { SearchFilters } from "@/components/search-filters"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Explore Travel Stories</h1>
        <p className="text-lg text-muted-foreground">Discover amazing travel experiences from around the world</p>
      </section>

      <SearchFilters />

      <Suspense fallback={<PostListSkeleton />}>
        <PostList />
      </Suspense>
    </div>
  )
}

function PostListSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {Array(5)
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
  )
}
