import { getApiBaseUrl } from './api'

export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${getApiBaseUrl()}/users/${userId}/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload avatar');
  }
  return response.json();
}


export async function uploadCover(userId, file) {
  const formData = new FormData();
  formData.append('coverImage', file);

  const response = await fetch(`${getApiBaseUrl()}/users/${userId}/cover`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload cover photo');
  }
  return response.json();
}
