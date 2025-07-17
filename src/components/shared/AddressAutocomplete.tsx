"use client";
import React, { useState, useRef } from "react";

export interface AddressAutocompleteProps {
  id?: string;
  value?: string;
  onSelect: (address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

console.log("Google api key", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

interface Suggestion {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
}

export default function AddressAutocomplete({
  id,
  value,
  onSelect,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch autocomplete suggestions using Google Places API (POST)
  const fetchSuggestions = async (input: string) => {
    setLoading(true);
    setSuggestions([]);
    try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY || "",
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress",
          },
          body: JSON.stringify({ textQuery: input, languageCode: "en" }),
        }
      );
      const data = await response.json();
      setLoading(false);
      if (data.places) {
        setSuggestionsOpen(true);
        setSuggestions(data.places);
      } else {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setLoading(false);
      setSuggestionsOpen(false);
      setSuggestions([]);
    }
  };

  // Fetch place details from Google API (GET)
  const fetchPlaceDetails = async (placeId: string, placeName: string) => {
    if (!placeId) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,formattedAddress,internationalPhoneNumber,rating,location,adrFormatAddress,addressComponents&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      setLoading(false);
      if (data && data.displayName) {
        const addressComponents: { types: string[]; longText: string }[] =
          data.addressComponents || [];
        const getComponent = (type: string) =>
          addressComponents.find((c) => c.types.includes(type))?.longText || "";
        const street = [getComponent("street_number"), getComponent("route")]
          .filter(Boolean)
          .join(" ");
        const city = getComponent("locality");
        const state = getComponent("administrative_area_level_1");
        const zip = getComponent("postal_code");
        const country = getComponent("country");
        const latitude = data.location?.latitude;
        const longitude = data.location?.longitude;
        onSelect({ street, city, state, zip, country, latitude, longitude });
        setQuery(placeName);
        setSuggestionsOpen(false);
        setSuggestions([]); // Hide suggestions
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      setLoading(false);
    }
  };

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (e.target.value.length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(e.target.value);
      }, 400);
    } else {
      setSuggestions([]);
      setSuggestionsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        className="w-full border rounded px-2 py-1"
        placeholder="Start typing address..."
        autoComplete="off"
        value={query}
        onChange={onQueryChange}
        onFocus={() => {
          if (suggestions.length > 0) setSuggestionsOpen(true);
        }}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      {suggestions.length > 0 && isSuggestionsOpen && (
        <div className="absolute z-10 w-full bg-white border rounded shadow mt-1 max-h-60 overflow-auto">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="px-3 py-2 cursor-pointer hover:bg-blue-100"
              onClick={() =>
                fetchPlaceDetails(
                  suggestion.id,
                  suggestion.displayName?.text || ""
                )
              }
            >
              <div className="font-medium">{suggestion.displayName?.text}</div>
              <div className="text-xs text-gray-500">
                {suggestion.formattedAddress}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
