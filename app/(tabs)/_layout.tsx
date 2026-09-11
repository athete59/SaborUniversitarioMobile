import { Tabs } from "expo-router";
import React from "react";

/**
 * Layout principal de navegação por abas da aplicação Sabor Universitário.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" },
      }}
    >
      {/* Ocultar barra de navegação inferior em todas as telas */}
      <Tabs.Screen name="Cliente/PaginaInicial" options={{ href: null }} />
      <Tabs.Screen name="Cliente/Cardapio" options={{ href: null }} />

      {/* Ocultar componentes auxiliares e telas internas da barra de abas inferior */}
      <Tabs.Screen name="Cliente/SideBar" options={{ href: null }} />
      <Tabs.Screen name="Cliente/Header" options={{ href: null }} />
      <Tabs.Screen name="Cliente/CardCliente" options={{ href: null }} />
      <Tabs.Screen name="Cliente/DetalheProduto" options={{ href: null }} />
      <Tabs.Screen name="Cliente/ResumoPedido" options={{ href: null }} />
      <Tabs.Screen name="Cliente/MeuPerfil" options={{ href: null }} />
      <Tabs.Screen name="Cliente/MeusPedidos" options={{ href: null }} />

      {/* Telas internas da Empresa */}
      <Tabs.Screen name="Empresa/Dashboard" options={{ href: null }} />
      <Tabs.Screen name="Empresa/CadastrarProduto" options={{ href: null }} />
      <Tabs.Screen name="Empresa/HeaderEmpresa" options={{ href: null }} />
      <Tabs.Screen name="Empresa/SideBarEmpresa" options={{ href: null }} />
      <Tabs.Screen name="Empresa/FormasPagamento" options={{ href: null }} />
      <Tabs.Screen name="Empresa/FormasRecebimento" options={{ href: null }} />
      <Tabs.Screen name="Empresa/TelaTipoRecebimento" options={{ href: null }} />
      <Tabs.Screen name="Empresa/TabRecebimentoPix" options={{ href: null }} />
      <Tabs.Screen name="Empresa/TabRecebimentoTransferencia" options={{ href: null }} />

      {/* Tela do Funcionário */}
      <Tabs.Screen name="Funcionario/ScannerPedido" options={{ href: null }} />
    </Tabs>
  );
}
