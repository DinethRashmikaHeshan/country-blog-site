"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api-client"
import type { Country } from "@/types"

interface CountryContextType {
  countries: Country[]
  isLoading: boolean
  getCountryByName: (name: string) => Country | undefined
  getCountryByCode: (code: string) => Country | undefined
}

const CountryContext = createContext<CountryContextType>({
  countries: [],
  isLoading: true,
  getCountryByName: () => undefined,
  getCountryByCode: () => undefined,
})

export const useCountries = () => useContext(CountryContext)

interface CountryProviderProps {
  children: ReactNode
}

export function CountryProvider({ children }: CountryProviderProps) {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to get countries from localStorage first
    const cachedCountries = localStorage.getItem("countries")

    if (cachedCountries) {
      try {
        setCountries(JSON.parse(cachedCountries))
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to parse cached countries", error)
        fetchCountries()
      }
    } else {
      fetchCountries()
    }
  }, [])

  const fetchCountries = async () => {
    try {
      const response = await apiClient.get("/countries")
      setCountries(response.data)

      // Cache the countries in localStorage
      localStorage.setItem("countries", JSON.stringify(response.data))
    } catch (error) {
      console.error("Failed to fetch countries", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCountryByName = (name: string) => {
    return countries.find((country) => country.name === name)
  }

  const getCountryByCode = (code: string) => {
    return countries.find((country) => country.code === code)
  }

  return (
    <CountryContext.Provider
      value={{
        countries,
        isLoading,
        getCountryByName,
        getCountryByCode,
      }}
    >
      {children}
    </CountryContext.Provider>
  )
}
