import { useCallback, useEffect, useState } from "react";
import { getMe, type AuthUser } from "../services/authService";

type UseCurrentUserResult = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const useCurrentUser = (): UseCurrentUserResult => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const me = await getMe();
      setUser(me);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load user.";
      setUser(null);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refresh: fetchUser };
};

export default useCurrentUser;
