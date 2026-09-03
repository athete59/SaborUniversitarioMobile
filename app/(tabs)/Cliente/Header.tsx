import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BerkshireSwash_400Regular,
  useFonts,
} from "@expo-google-fonts/berkshire-swash";

import { useCartStore } from "../../stores/useCartStore";

export interface ItemCarrinho {
  id: string | number;
  nome: string;
  preco: number | string;
  quantidade: number;
  imagem?: string;
}

interface HeaderProps {
  sidebarAberta: boolean;
  setSidebarAberta: React.Dispatch<React.SetStateAction<boolean>>;
  nomeUsuario?: string;
  fichas?: number;
}

export default function Header({
  sidebarAberta,
  setSidebarAberta,
  nomeUsuario,
  fichas,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Escuta o array do carrinho direto da store global
  const carrinho = useCartStore((state) => state.carrinho);

  // Calcula o total de itens de forma reativa instantânea
  const totalItens = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  }, [carrinho]);

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
  });

  return (
    <View
      style={[
        styles.header,
        { paddingTop: Math.max(insets.top, 16) + 8 },
      ]}
    >
      {/* Botão Perfil / Menu Lateral */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          nomeUsuario ? `Abrir menu de ${nomeUsuario}` : "Abrir menu lateral"
        }
        style={({ pressed }) => [
          styles.perfilBtn,
          pressed && styles.botaoPressionado,
        ]}
        onPress={() => setSidebarAberta((prev) => !prev)}
        hitSlop={10}
      >
        <View style={styles.foto} />
      </Pressable>

      {/* Título Centralizado */}
      <View style={styles.tituloContainer}>
        <Text
          style={[styles.titulo, fontsLoaded && styles.tituloComFonte]}
          numberOfLines={1}
        >
          Sabor Universitário
        </Text>
        {fichas !== undefined && (
          <Text style={styles.subtitulo}>{fichas} fichas</Text>
        )}
      </View>

      {/* Botão Carrinho */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Carrinho de compras, ${totalItens} itens`}
        style={({ pressed }) => [
          styles.carrinhoBtn,
          pressed && styles.carrinhoBtnPressionado,
        ]}
        onPress={() => router.push("/(tabs)/Cliente/ResumoPedido" as Href)}
        hitSlop={10}
      >
        <Text style={styles.carrinhoTexto}>🛒 {totalItens}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FF7124",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  perfilBtn: {
    padding: 2,
    zIndex: 2,
  },
  foto: {
    width: 38,
    height: 38,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
  },
  tituloContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },
  tituloComFonte: {
    fontFamily: "BerkshireSwash",
    fontWeight: "normal",
  },
  subtitulo: {
    color: "#FFE8D6",
    fontSize: 12,
    marginTop: 2,
  },
  carrinhoBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  carrinhoBtnPressionado: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  carrinhoTexto: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "700",
  },
  botaoPressionado: {
    opacity: 0.75,
  },
});