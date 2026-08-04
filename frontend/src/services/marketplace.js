import { getAccessToken } from "@/lib/firebase";

const API_URL = "http://localhost:8080/api/marketplace";

function getHeaders() {
  const token = getAccessToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ==============================
// GET ALL MARKETPLACE ITEMS
// ==============================
export async function getMarketplaceItems() {
  const response = await fetch(API_URL, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GET Marketplace Error:", errorText);
    throw new Error(errorText || "Failed to load marketplace items");
  }

  return response.json();
}

// ==============================
// GET SINGLE ITEM
// ==============================
export async function getMarketplaceItem(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GET Item Error:", errorText);
    throw new Error(errorText || "Failed to load marketplace item");
  }

  return response.json();
}

// ==============================
// CREATE ITEM
// ==============================
export async function createMarketplaceItem(data) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("CREATE Error:", errorText);
    throw new Error(errorText || "Failed to create marketplace item");
  }

  return response.json();
}

// ==============================
// UPDATE ITEM
// ==============================
export async function updateMarketplaceItem(id, data) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("UPDATE Error:", errorText);
    throw new Error(errorText || "Failed to update marketplace item");
  }

  return response.json();
}


// DELETE ITEM

export async function deleteMarketplaceItem(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DELETE Error:", errorText);
    throw new Error(errorText || "Failed to delete marketplace item");
  }

  return true;
}