import { Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7124",
      }}
    >
      {/* Telas visíveis no menu do Cliente */}
      <Tabs.Screen name="Cliente/PaginaInicial" options={{ title: "Início" }} />
      <Tabs.Screen name="Cliente/Cardapio" options={{ title: "Cardápio" }} />

      {/* Ocultar componentes e telas internas da Empresa da barra de navegação */}
      <Tabs.Screen name="Cliente/SideBar" options={{ href: null }} />
      <Tabs.Screen name="Cliente/Header" options={{ href: null }} />
      <Tabs.Screen name="Cliente/CardCliente" options={{ href: null }} />
      <Tabs.Screen name="Empresa/CadastrarProduto" options={{ href: null }} />
      <Tabs.Screen name="Empresa/HeaderEmpresa" options={{ href: null }} />
      <Tabs.Screen name="Empresa/SideBarEmpresa" options={{ href: null }} />
    </Tabs>
  );
}
