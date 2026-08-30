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

    // Proteção de rota: se NÃO estiver logado e tentar acessar área protegida, vai para o Login (raiz)
    if (!user && !estaNoLogin) {
      router.replace("/" as any);
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
