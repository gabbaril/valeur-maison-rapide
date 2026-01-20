// Parser for Centris PDF property listings
// Extracts structured data from Centris real estate listing PDFs

export interface ParsedListing {
  source: {
    type: "centris_pdf"
    filename: string
    storage_path: string
    parsed_at: string
    parse_confidence: number
  }
  property: {
    address_full: string
    address_street: string
    address_city: string
    address_region: string
    address_postal_code: string
    property_type: string
    ownership_type: string
    year_built: number | null
    living_area_sqft: number | null
    lot_area_sqft: number | null
    rooms: {
      bedrooms: number | null
      bathrooms: number | null
      powder_rooms: number | null
    }
    parking: {
      garage: number | null
      outdoor: number | null
    }
  }
  pricing: {
    list_price: number | null
    sold_price: number | null
    sold_date: string | null
  }
  notes: {
    highlights: string[]
    raw_text_excerpt: string
  }
}

export function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
}

export function parsePrice(text: string): number | null {
  const pricePatterns = [
    /\$?\s?(\d{1,3}(?:\s?\d{3})*)/g,
    /prix[:\s]+\$?\s?(\d{1,3}(?:\s?\d{3})*)/gi,
    /(\d{1,3}(?:\s?\d{3})*)\s?\$/g,
  ]

  for (const pattern of pricePatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const numStr = match[1].replace(/\s/g, "")
      const num = Number.parseInt(numStr, 10)
      if (num >= 50000 && num <= 10000000) {
        return num
      }
    }
  }

  return null
}

export function parseAddress(text: string): {
  full: string
  street: string
  city: string
  region: string
  postal_code: string
} {
  const result = { full: "", street: "", city: "", region: "", postal_code: "" }

  const addressPattern = /(\d+[A-Z]?\s+[^,\n]{5,50}?),\s*([^,\n]{3,30}?),?\s*(QC|Québec)?/i
  const match = text.match(addressPattern)

  if (match) {
    result.street = match[1]?.trim() || ""
    result.city = match[2]?.trim() || ""
    result.region = match[3]?.trim() || "QC"
    result.full = `${result.street}, ${result.city}${result.region ? ", " + result.region : ""}`
  }

  const postalPattern = /([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i
  const postalMatch = text.match(postalPattern)
  if (postalMatch) {
    result.postal_code = postalMatch[1].replace(/\s/g, "").toUpperCase()
  }

  return result
}

export function extractListingData(text: string, filename: string, storagePath: string): ParsedListing {
  const normalized = normalizeText(text)
  let confidence = 0.0

  const address = parseAddress(normalized)
  if (address.full) confidence += 0.25

  const listPrice = parsePrice(normalized)
  if (listPrice) confidence += 0.2

  let bedrooms: number | null = null
  const bedroomPatterns = [/(\d+)\s*(?:ch(?:ambres?)?|bed(?:rooms?)?)/gi, /chambres?\s*[:\s]+(\d+)/gi]
  for (const pattern of bedroomPatterns) {
    const match = normalized.match(pattern)
    if (match) {
      bedrooms = Number.parseInt(match[1], 10)
      confidence += 0.15
      break
    }
  }

  let bathrooms: number | null = null
  const bathroomPatterns = [
    /(\d+)\s*(?:salle?s? de bains?|sdb|bath(?:rooms?)?)/gi,
    /salle?s? de bains?\s*[:\s]+(\d+)/gi,
  ]
  for (const pattern of bathroomPatterns) {
    const match = normalized.match(pattern)
    if (match) {
      bathrooms = Number.parseInt(match[1], 10)
      confidence += 0.15
      break
    }
  }

  let powderRooms: number | null = null
  const powderPattern = /(\d+)\s*salle?s? d'eau/gi
  const powderMatch = normalized.match(powderPattern)
  if (powderMatch) {
    powderRooms = Number.parseInt(powderMatch[1], 10)
    confidence += 0.1
  }

  let yearBuilt: number | null = null
  const yearPattern = /(?:constru(?:ction|it)e?|année)[:\s]+(\d{4})/gi
  const yearMatch = normalized.match(yearPattern)
  if (yearMatch) {
    const year = Number.parseInt(yearMatch[1], 10)
    if (year >= 1800 && year <= new Date().getFullYear()) {
      yearBuilt = year
      confidence += 0.1
    }
  }

  let livingArea: number | null = null
  const areaPatterns = [/(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:pi[²2]|p\.c\.|pieds? carr)/gi, /superficie[:\s]+(\d{1,4})/gi]
  for (const pattern of areaPatterns) {
    const match = normalized.match(pattern)
    if (match) {
      const areaStr = match[1].replace(/,/g, ".")
      livingArea = Math.round(Number.parseFloat(areaStr))
      confidence += 0.1
      break
    }
  }

  let garage: number | null = null
  const garagePattern = /garage[:\s]+(\d+)/gi
  const garageMatch = normalized.match(garagePattern)
  if (garageMatch) {
    garage = Number.parseInt(garageMatch[1], 10)
  }

  const excerpt = normalized.slice(0, 600)

  return {
    source: {
      type: "centris_pdf",
      filename,
      storage_path: storagePath,
      parsed_at: new Date().toISOString(),
      parse_confidence: Math.min(confidence, 1.0),
    },
    property: {
      address_full: address.full,
      address_street: address.street,
      address_city: address.city,
      address_region: address.region,
      address_postal_code: address.postal_code,
      property_type: "",
      ownership_type: "",
      year_built: yearBuilt,
      living_area_sqft: livingArea,
      lot_area_sqft: null,
      rooms: {
        bedrooms,
        bathrooms,
        powder_rooms: powderRooms,
      },
      parking: {
        garage,
        outdoor: null,
      },
    },
    pricing: {
      list_price: listPrice,
      sold_price: null,
      sold_date: null,
    },
    notes: {
      highlights: [],
      raw_text_excerpt: excerpt,
    },
  }
}
