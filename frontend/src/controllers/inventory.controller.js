import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useInventoryItems({ status }) {
  const APIURL = `/inventory?status=${status}`;
  const { data, error, isLoading, mutate } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
    mutate,
  };
}

export async function bulkAddInventoryItems(formData) {
  try {
    const response = await ApiClient.post("/inventory/bulk-add-items", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addInventoryItem(item) {
  try {
    const response = await ApiClient.post("/inventory/add-item", item);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateInventoryItem({id, title, unit, min_quantity_threshold}) {
  try {
    const response = await ApiClient.put(`/inventory/${id}`, {
      title, unit, min_quantity_threshold
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addInventoryItemStockMovement({id, movementType, quantity, note }) {
  try {
    const response = await ApiClient.patch(`/inventory/${id}/add-stock-movement`, {
      movementType, quantity, note
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteInventoryItem({id}) {
  try {
    const response = await ApiClient.delete(`/inventory/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export function useInventoryLogs({ type, from = null, to = null, movementType = null }) {
  const APIURL = `/inventory/logs?type=${type}&from=${from}&to=${to}&movementType=${movementType}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export function useInventoryDashboard({ type, from = null, to = null}) {
  const APIURL = `/inventory/dashboard?type=${type}&from=${from}&to=${to}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}
