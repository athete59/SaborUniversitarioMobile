import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextData {
  user: any | null;
  loading: boolean;
  signInManual: (usuario: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function carregarUsuarioSalvo() {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("usuario_logado");
        if (usuarioSalvo) {
          setUser(JSON.parse(usuarioSalvo));
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarioSalvo();
  }, []);

  async function signInManual(usuario: any) {
    await AsyncStorage.setItem("usuario_logado", JSON.stringify(usuario));
    setUser(usuario);
  }

  async function signOut() {
    await AsyncStorage.removeItem("usuario_logado");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInManual,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
