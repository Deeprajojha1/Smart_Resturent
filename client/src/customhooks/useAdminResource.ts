import { useEffect, useState } from "react";

type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load data";
};

export const useAdminResource = <T,>(
  loader: () => Promise<T>,
  dependencies: unknown[] = []
) => {
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    setState((current) => ({ ...current, loading: true, error: null }));

    loader()
      .then((data) => {
        if (isMounted) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setState({ data: null, loading: false, error: getErrorMessage(error) });
        }
      });

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return state;
};
