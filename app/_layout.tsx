import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../services/authContext";

function RouteProtector() {
  const { user, loading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const estaNoLogin =
      segments.length === 0 ||
      segments[0] === "index" ||
      segments[0] === "esqueci-senha" ||
      segments[0] === "redefinir-senha";

    if (!user && !estaNoLogin) {
      // Se não tem usuário logado e tenta acessar qualquer tela -> força ir para o Login
      router.replace("/" as any);
    } else if (user && estaNoLogin) {
      // Se está logado e acessou a tela de login -> vai para a tela inicial correspondente
      const emailUsuario = (user as any)?.email || "";

      if (emailUsuario.toLowerCase() === "luiza@gmail.com") {
        router.replace("/(tabs)/Empresa/CadastrarProduto" as any);
      } else {
        router.replace("/(tabs)/Cliente/PaginaInicial" as any);
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF7124" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RouteProtector />
    </AuthProvider>
  );
}
