let memoryAccessToken = null;

export const setAccessToken = (token) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => {
  return memoryAccessToken;
};

export const clearAccessToken = () => {
  memoryAccessToken = null;
};
