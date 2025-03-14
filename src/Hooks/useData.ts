import axios from "axios";
import { useEffect, useState } from "react";

const useData = <T>() => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/tasks");
      const data: T[] = await res.data;
      setData(data);
    } catch (err) {
      if (error) {
        setError("An unknown error has occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const postData = async (title: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post<T>("http://127.0.0.1:8000/tasks", {
        title,
      });
      setData((prevData) => [...prevData, response.data]);
      return response.data;
    } catch (err) {
      setError("An error posting data has occurred");
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteData = async (id: number) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/tasks/${id}`);
      setData((prevData) => prevData.filter((task) => task !== id));
    } catch (err) {
      setError("Unable to delete task");
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = async (id: number, title: string) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8000/tasks/${id}`, {
        title,
      });
      setData((prevData) =>
        prevData.map((data) => (data === id ? response.data : data))
      );
    } catch (err) {
      setError("Couldnt update the data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, error, isLoading, postData, deleteData, updateData };
};

export default useData;
