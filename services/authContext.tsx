import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { TipoUsuario, UsuarioAutenticado } from "./usuarioService";

interface AuthContextData {
  user: UsuarioAutenticado | null;
  tipo: TipoUsuario | null;
  perfil: any | null;
  loading: boolean;
  signInManual: (usuario: UsuarioAutenticado) => Promise<void>;
  atualizarPerfil: (novoPerfil: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

/**
 * Provedor de contexto global para autenticação e persistência de sessão.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UsuarioAutenticado | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    /**
     * Recupera o usuário previamente persistido no AsyncStorage.
     */
    async function carregarUsuarioSalvo() {
      try {
        const usuarioSalvo = await AsyncStorage.getItem("usuario_logado");
        if (usuarioSalvo) {
          const parsed = JSON.parse(usuarioSalvo);
          setUser(parsed);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário:", e);
      } finally {
        setLoading(false);
      }
    }

    carregarUsuarioSalvo();
  }, []);

  /**
   * Armazena os dados do usuário autenticado no estado e no AsyncStorage.
   * @param usuario Objeto contendo os dados do usuário e perfil
   */
  async function signInManual(usuario: UsuarioAutenticado) {
    await AsyncStorage.setItem("usuario_logado", JSON.stringify(usuario));
    setUser(usuario);
  }

  /**
   * Mescla e persiste dados atualizados no perfil do usuário conectado.
   * @param novoPerfil Novos dados do perfil
   */
  async function atualizarPerfil(novoPerfil: any) {
    if (!user) return;
    const usuarioAtualizado: UsuarioAutenticado = {
      ...user,
      perfil: {
        ...user.perfil,
        ...novoPerfil,
      },
    };
    await AsyncStorage.setItem("usuario_logado", JSON.stringify(usuarioAtualizado));
    setUser(usuarioAtualizado);
  }

  /**
   * Remove os dados da sessão do AsyncStorage e limpa o estado de autenticação.
   */
  async function signOut() {
    await AsyncStorage.removeItem("usuario_logado");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tipo: user?.tipo ?? null,
        perfil: user?.perfil ?? null,
        loading,
        signInManual,
        atualizarPerfil,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook customizado para acesso prático às informações de autenticação do usuário.
 */
export function useAuth() {
  return useContext(AuthContext);
}
