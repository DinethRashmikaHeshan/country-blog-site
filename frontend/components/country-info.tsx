import { Card, CardContent } from "@/components/ui/card"
import type { Country } from "@/types"

interface CountryInfoProps {
  country: Country
  compact?: boolean
}

export function CountryInfo({ country, compact = false }: CountryInfoProps) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-lg">{country.flag}</span>
        <span>{country.name}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{country.capital}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{country.flag}</div>
          <div>
            <h3 className="font-medium">{country.name}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Capital: {country.capital}</p>
              <p>Currency: {country.currency}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
