import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorData;
    try {
      // Clone the response to avoid consuming it
      const resClone = res.clone();
      try {
        errorData = await resClone.json();
        console.error("API Error Details:", JSON.stringify(errorData, null, 2));
        
        if (errorData.message) {
          let errorMsg = errorData.message;
          
          // Füge detaillierte Fehlerinformationen hinzu, wenn verfügbar
          if (errorData.errors && Array.isArray(errorData.errors)) {
            errorMsg += ": " + errorData.errors.map((e: any) => 
              `${e.path ? e.path.join('.') + ': ' : ''}${e.message || e.code}`
            ).join('; ');
          }
          
          throw new Error(errorMsg);
        }
      } catch {
        // Wenn wir es nicht als JSON parsen können, versuchen wir es als Text
        const text = await res.text() || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
