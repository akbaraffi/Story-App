import CONFIG from "../config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
};

export async function registerUser({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

export async function loginUser({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

export async function getAllStories(token) {
  const response = await fetch(`${ENDPOINTS.GET_ALL_STORIES}?location=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function addNewStory(token, formData) {
  const response = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return await response.json();
}
