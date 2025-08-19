'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import { getUser, setUser, getOrganization, setOrganization, clearAuthData } from "@/lib/auth";
import type { User, Organization } from "@/lib/auth";

type AuthContextType = {
  user: User | null;
  organization: Organization | null;
  setAuth: (user: User, organization: Organization) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  organization: null,
  setAuth: () => {},
  clearAuth: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(getUser());
  const [organization, setOrgState] = useState<Organization | null>(getOrganization());

  const setAuth = (user: User, organization: Organization) => {
    setUser(user);
    setOrganization(organization);
    setUserState(user);
    setOrgState(organization);
  };

  const clearAuth = () => {
    clearAuthData();
    setUserState(null);
    setOrgState(null);
  };

  useEffect(() => {
    setUserState(getUser());
    setOrgState(getOrganization());
  }, []);

  return (
    <AuthContext.Provider value={{ user, organization, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);