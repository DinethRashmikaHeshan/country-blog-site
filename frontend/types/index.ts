export interface User {
  id: number
  username: string
  email: string
}

export interface Post {
  id: number
  user_id: number
  title: string
  content: string
  country: string
  visit_date: string
  created_at: string
  username: string
  likes: number
  dislikes: number
}

export interface Comment {
  id: number
  post_id: number
  user_id: number
  content: string
  created_at: string
  username: string
}

export interface Country {
  code: string
  name: string
  capital: string
  currency: string
  flag: string
}
