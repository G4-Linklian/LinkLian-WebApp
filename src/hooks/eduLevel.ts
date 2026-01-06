import { useState, useEffect } from "react";
import { getEduLevelMaster } from "@/utils/api/eduLevel";
import { decodeRegistrationToken } from '@/utils/authToken';


interface SelectOption {
  value: string;
  label: string;
}

export const useEduLevelOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // const token = decodeRegistrationToken();
        
        // if (!token?.institution?.inst_id) {
        //     console.warn("No institution ID found in token");
        //     return;
        // }

        const eduLevelData = await getEduLevelMaster({
          flag_valid: true,
        });

        console.log("Fetched edu levels:", eduLevelData);


        const formattedOptions = eduLevelData.data.map((edu: any) => ({
          value: edu.edu_lev_id,
          label: edu.level_name,
        }));

        setOptions(formattedOptions);
      } catch (err) {
        console.error("Failed to fetch edu levels:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);


  return { options, isLoading, error };
};