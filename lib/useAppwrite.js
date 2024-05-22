import { Alert, useState, useEffect } from "react";

const useAppwrite = (fn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      if (!isActive) return;
      setLoading(true);
      try {
        const res = await fn();
        if (isActive) setData(res);
      } catch (error) {
        if (isActive) Alert.alert("Error", error.message);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isActive = false;  // Prevents state update if the component is unmounted
    };

  }, deps);  // Reruns fetchData when any dependencies change

  const refetch = () => fetchData();

  return { data, loading, refetch };
};

export default useAppwrite;
