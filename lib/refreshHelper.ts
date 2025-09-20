import axios from "axios";

let isRefreshing = false;
let subscribers: (() => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach((callback) => callback());
  subscribers = [];
};

export const refreshTokenAndRetry = async (): Promise<boolean> => {
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribers.push(() => resolve(true));
    });
  }

  isRefreshing = true;

  try {
    const res = await axios.post(
      "/auth/refresh",
      {},
      {
        baseURL: process.env.NEXT_PUBLIC_API_BACKEND_URL,
        withCredentials: true,
      }
    );

    if (res.status === 200 && res.data.success) {
      notifySubscribers();
      return true;
    } else {
      window.dispatchEvent(new Event("logout")); // Notify all tabs
      return false;
    }
  } catch (e) {
    window.dispatchEvent(new Event("logout"));
    return false;
  } finally {
    isRefreshing = false;
  }
};
