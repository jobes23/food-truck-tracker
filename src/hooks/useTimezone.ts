import { useState, useEffect } from "react";
import useAPI from "./useAPI";

const useTimezone = (lat: number, lng: number) => {
  const [timezone, setTimezone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { callApi } = useAPI<{ zoneName: string }>();

  useEffect(() => {
    const fetchTimezone = async () => {
      try {
        setLoading(true);
        const { success, data, error } = await callApi(
          `getTimezone?lat=${lat}&lng=${lng}`,
          "GET",
          null,
          {},
          false // No auth required
        );

        if (success && data?.zoneName) {
          setTimezone(data.zoneName);
        } else {
          console.error("[useTimezone] Failed to fetch timezone:", error);
        }
      } catch (err) {
        console.error("[useTimezone] Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimezone();
  }, [lat, lng, callApi]);

  return { timezone, loading };
};

export default useTimezone;
