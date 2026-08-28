import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7124",
        tabBarInactiveTintColor: "#777777",
      }}
    >
      {/* Esconde a tela de login da barra inferior */}
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      {/* Exibe a Tela Principal do Cliente */}
      <Tabs.Screen
        name="Cliente/PaginaInicial"
        options={{
          title: "Início",
        }}
      />

      {/* Oculta componentes e sub-rotas da barra inferior */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="redefinir-senha" options={{ href: null }} />
      <Tabs.Screen name="Cliente/Cardapio" options={{ href: null }} />
      <Tabs.Screen name="Cliente/CardCliente" options={{ href: null }} />
      <Tabs.Screen name="Cliente/SideBar" options={{ href: null }} />
      <Tabs.Screen name="Cliente/Header" options={{ href: null }} />
    </Tabs>
  );
}
