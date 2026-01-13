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

        const token = decodeRegistrationToken();
        let eduLevType = '';
        
        if (token && token.institution && token.institution.inst_type) {
          if (token.institution.inst_type === "school") {
            eduLevType = "high school";
          } else if (token.institution.inst_type === "uni") {
            eduLevType = "bachelor";
          }
        }


        const eduLevelData = await getEduLevelMaster({
          flag_valid: true,
          edu_type: eduLevType,
        });


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