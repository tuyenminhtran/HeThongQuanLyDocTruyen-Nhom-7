interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

/** Trích xuất thông báo lỗi dễ đọc từ Axios / Error mà không cần kiểu `any`. */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null) {
    const apiErr = err as ApiErrorShape;
    const serverMsg = apiErr.response?.data?.message;
    if (typeof serverMsg === "string" && serverMsg.trim()) {
      return serverMsg;
    }
    if (typeof apiErr.message === "string" && apiErr.message.trim()) {
      return apiErr.message;
    }
  }
  return fallback;
}
