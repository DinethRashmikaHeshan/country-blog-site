"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCountries } from "@/context/country-context"
import { Search, X } from "lucide-react"

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { countries } = useCountries()

  const [searchType, setSearchType] = useState<"country" | "username">("country")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedSort, setSelectedSort] = useState("newest")

  // Initialize from URL params
  useEffect(() => {
    const country = searchParams.get("country")
    const username = searchParams.get("username")
    const sort = searchParams.get("sort") || "newest"

    if (country) {
      setSearchType("country")
      setSelectedCountry(country)
    } else if (username) {
      setSearchType("username")
      setSearchQuery(username)
    }

    setSelectedSort(sort)
  }, [searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()

    // Add search params
    if (searchType === "country" && selectedCountry) {
      params.set("country", selectedCountry)
    } else if (searchType === "username" && searchQuery) {
      params.set("username", searchQuery)
    }

    // Add sort param
    if (selectedSort !== "newest") {
      params.set("sort", selectedSort)
    }

    router.push(`/?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchType("country")
    setSelectedCountry("")
    setSearchQuery("")
    setSelectedSort("newest")
    router.push("/")
  }

  const hasActiveFilters = searchParams.has("country") || searchParams.has("username") || searchParams.has("sort")

  return (
    <div className="bg-muted/40 p-4 rounded-lg mb-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Select value={searchType} onValueChange={(value) => setSearchType(value as "country" | "username")}>
              <SelectTrigger>
                <SelectValue placeholder="Search by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="country">Country</SelectItem>
                <SelectItem value="username">Username</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {searchType === "country" ? (
            <div className="flex-1">
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Username"
                  className="pl-8"
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="most-liked">Most Liked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between">
          <Button type="submit" className="gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>

          {hasActiveFilters && (
            <Button type="button" variant="outline" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
