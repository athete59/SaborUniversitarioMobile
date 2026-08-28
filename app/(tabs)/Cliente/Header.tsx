import {
    BerkshireSwash_400Regular,
    useFonts,
} from "@expo-google-fonts/berkshire-swash";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
}

interface HeaderProps {
  sidebarAberta: boolean;
  setSidebarAberta: React.Dispatch<React.SetStateAction<boolean>>;
  carrinho?: ItemCarrinho[];
  nomeUsuario?: string;
  fichas?: number;
}

export default function Header({
  sidebarAberta,
  setSidebarAberta,
  carrinho = [],
}: HeaderProps) {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
  });

  const totalItens = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  return (
    <View style={styles.header}>
      {/* Botão Perfil / Avatar (Lado Esquerdo) */}
      <Pressable
        style={({ pressed }) => [
          styles.perfilBtn,
          pressed && styles.botaoPressionado,
        ]}
        onPress={() => setSidebarAberta(!sidebarAberta)}
        hitSlop={8}
      >
        <View style={styles.foto} />
      </Pressable>

      {/* Título Centralizado com espaço seguro para não sobrepor */}
      <View style={styles.tituloContainer}>
        <Text style={styles.titulo} numberOfLines={1}>
          Sabor Universitário
        </Text>
      </View>

      {/* Botão Carrinho (Lado Direito) */}
      <Pressable
        style={({ pressed }) => [
          styles.carrinhoBtn,
          pressed && styles.carrinhoBtnPressionado,
        ]}
        onPress={() => router.push("/modal" as any)}
        hitSlop={8}
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
    paddingTop: 44,
    paddingBottom: 14,
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
    fontFamily: "BerkshireSwash",
    fontSize: 20,
    textAlign: "center",
    includeFontPadding: false,
  },
  carrinhoBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 5,
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
    fontFamily: "InterBold",
    fontSize: 14,
  },
  botaoPressionado: {
    opacity: 0.75,
  },
});
