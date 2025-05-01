import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { User } from "@/types"
import { Mail } from "lucide-react"

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <Link href={`/users/${user.id}`} className="font-medium hover:underline">
              {user.username}
            </Link>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="h-3 w-3 mr-1" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
