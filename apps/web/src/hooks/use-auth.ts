import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCurrentUser, login, logout, register } from "../lib/api/auth";

import type { AuthenticatedUser, LoginRequest, RegisterRequest } from "@stackleo/types";

export const authQueryKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authQueryKeys.all, "currentUser"] as const,
};

/**
 * The single source of truth for "is anyone signed in" — a Server
 * Component/Middleware can't answer this (see `RequireAuth`'s doc
 * comment for why), so every part of the UI that needs auth state reads
 * this same cached query instead of tracking its own copy.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authQueryKeys.currentUser(),
    queryFn: ({ signal }) => getCurrentUser(signal),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginRequest) => login(input),
    onSuccess: (user: AuthenticatedUser) => {
      queryClient.setQueryData(authQueryKeys.currentUser(), user);
    },
  });
}

/** Does not touch auth state — registering doesn't sign the user in (see
 * `lib/api/auth.ts`'s `register` doc comment). Callers direct the user to
 * `/login` afterward. */
export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterRequest) => register(input),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.currentUser(), null);
    },
  });
}
