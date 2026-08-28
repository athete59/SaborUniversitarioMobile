import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "../services/authContext";

function RouteProtector() {
    const { session, loading } = useAuth();
    const segments = useSegments() as string[];
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const estaNoLogin =
            segments.length === 0 ||
            segments[0] === "index" ||
            segments[0] === "esqueci-senha" ||
            segments[0] === "redefinir-senha";

        if (!session && !estaNoLogin) {
            router.replace("/");
        } else if (session && estaNoLogin) {
            router.replace("/(tabs)/Cliente/PaginaInicial");
        }
    }, [session, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#ff7124" />
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