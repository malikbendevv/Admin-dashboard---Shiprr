interface AddressComponent {
  types: string[];
  long_name: string;
}

export const geocodeLatLng = async (lat: number, lng: number) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      return {
        street:
          result.address_components.find((c: AddressComponent) =>
            c.types.includes("route")
          )?.long_name || "",
        city:
          result.address_components.find((c: AddressComponent) =>
            c.types.includes("locality")
          )?.long_name || "",
        state:
          result.address_components.find((c: AddressComponent) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "",
        country:
          result.address_components.find((c: AddressComponent) =>
            c.types.includes("country")
          )?.long_name || "",
        zip:
          result.address_components.find((c: AddressComponent) =>
            c.types.includes("postal_code")
          )?.long_name || "",
        latitude: lat,
        longitude: lng,
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Geocoding failed:", err);
  }
};
