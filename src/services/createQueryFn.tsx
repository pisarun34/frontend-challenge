import { AxiosInstance } from 'axios';

export async function createQueryFn<T = any>(
    client: AxiosInstance,
    queryKey: ReadonlyArray<any>,
  ) {
    const { url, params } = queryKey.reduce(
      (acc, val) => {
        if (typeof val === "string" || typeof val === "number") {
          acc.url = `${acc.url}/${val.toString()}`;
        } else if (typeof val === "object") {
          const newObj = Object.fromEntries(Object.entries(val));
          acc.params = { ...acc.params, ...newObj };
        }
        return acc;
      },
      { url: "", params: {} } as { url: string; params: Record<string, unknown> },
    );
  
    const res = await client.get<T>(url, { params });
    return res.data;
  }
  