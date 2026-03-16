"use client"

import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
  name?: string
}

declare global {
  interface Window {
    google: any
    initGooglePlaces: () => void
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "123 Rue Exemple, Trois-Rivières",
  className = "",
  required = false,
  id = "address",
  name = "address",
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const autocompleteElementRef = useRef<any | null>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  // Update local state when prop changes
  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    // Check if Google Maps is loaded (script is loaded via layout.tsx)
    if (window.google?.maps?.places?.PlaceAutocompleteElement) {
      setIsGoogleLoaded(true)
      return
    }

    // Wait for Google Maps to load
    const checkGoogle = setInterval(() => {
      if (window.google?.maps?.places?.PlaceAutocompleteElement) {
        setIsGoogleLoaded(true)
        clearInterval(checkGoogle)
      }
    }, 100)

    // Cleanup interval after 10 seconds if not loaded
    const timeout = setTimeout(() => {
      clearInterval(checkGoogle)
    }, 10000)

    return () => {
      clearInterval(checkGoogle)
      clearTimeout(timeout)
    }
  }, [])

  const handlePlaceSelect = useCallback((place: any) => {
    if (place?.formattedAddress) {
      setInputValue(place.formattedAddress)
      onChange(place.formattedAddress)
    }
  }, [onChange])

  useEffect(() => {
    if (!isGoogleLoaded || !containerRef.current || autocompleteElementRef.current) return

    // Create PlaceAutocompleteElement
    const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: "ca" },
      types: ["address"],
    })

    // Style the element to match the design
    autocompleteElement.style.width = "100%"
    
    // Add placeholder attribute
    autocompleteElement.setAttribute("placeholder", placeholder)

    // Append to container
    containerRef.current.appendChild(autocompleteElement)
    autocompleteElementRef.current = autocompleteElement

    // Handle place selection
    autocompleteElement.addEventListener("gmp-placeselect", async (event: any) => {
      const place = event.place
      await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] })
      handlePlaceSelect(place)
    })

    // Cleanup on unmount
    return () => {
      if (autocompleteElementRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(autocompleteElementRef.current)
        } catch (e) {
          // Element might already be removed
        }
        autocompleteElementRef.current = null
      }
    }
  }, [isGoogleLoaded, placeholder, handlePlaceSelect])

  // Fallback input for when Google isn't loaded
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      {/* Hidden input for form validation */}
      <input
        ref={hiddenInputRef}
        type="hidden"
        id={id}
        name={name}
        value={inputValue}
        required={required}
      />
      
      {/* Container for PlaceAutocompleteElement */}
      <div 
        ref={containerRef} 
        className={`address-autocomplete-container ${className}`}
        style={{
          display: isGoogleLoaded ? "block" : "none",
        }}
      />
      
      {/* Fallback input when Google isn't loaded */}
      {!isGoogleLoaded && (
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
          required={required}
        />
      )}
      
      {/* Styles for the PlaceAutocompleteElement */}
      <style jsx global>{`
        .address-autocomplete-container input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          outline: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .address-autocomplete-container input:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
        }
        
        @media (min-width: 640px) {
          .address-autocomplete-container input {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  )
}
