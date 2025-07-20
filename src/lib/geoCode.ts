export const geocodeLatLng = async (lat: number, lng: number) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  try {
    console.log("api key", apiKey);

    console.log(lat, lng);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    const data = await response.json();

    console.log({ data });

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      // Parse address components as needed
      return {
        street:
          result.address_components.find((c: any) => c.types.includes("route"))
            ?.long_name || "",
        city:
          result.address_components.find((c: any) =>
            c.types.includes("locality")
          )?.long_name || "",
        state:
          result.address_components.find((c: any) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "",
        country:
          result.address_components.find((c: any) =>
            c.types.includes("country")
          )?.long_name || "",
        zip:
          result.address_components.find((c: any) =>
            c.types.includes("postal_code")
          )?.long_name || "",
        latitude: lat,
        longitude: lng,
      };
    } else {
      return null;
    }
  } catch (err) {
    console.log({ err });
  }
};
