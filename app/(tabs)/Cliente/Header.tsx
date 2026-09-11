import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";
import {
  BerkshireSwash_400Regular,
  useFonts,
} from "@expo-google-fonts/berkshire-swash";

import { useAuth } from "../../../services/authContext";
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
}

/**
 * Cabeçalho unificado do cliente com botão de perfil, título idêntico à tela de login e carrinho.
 * @param props Propriedades para controle da sidebar e nome de exibição
 */
export default function Header({
  sidebarAberta,
  setSidebarAberta,
  nomeUsuario,
}: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  const nomeExibicao = nomeUsuario || user?.nome;

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
    <View style={styles.header}>
      {/* Título Centralizado no mesmo estilo e proporção da tela de Login */}
      <View style={styles.tituloContainer} pointerEvents="none">
        <Text
          style={[styles.titulo, fontsLoaded && styles.tituloComFonte]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Sabor Universitário
        </Text>
      </View>

      {/* Botão Perfil / Menu Lateral à Esquerda */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          nomeExibicao ? `Abrir menu de ${nomeExibicao}` : "Abrir menu lateral"
        }
        style={({ pressed }) => [
          styles.perfilBtn,
          pressed && styles.botaoPressionado,
        ]}
        onPress={() => setSidebarAberta((prev) => !prev)}
        hitSlop={10}
      >
        {user?.perfil?.foto_url ? (
          <Image source={{ uri: user.perfil.foto_url }} style={styles.foto} />
        ) : (
          <View style={styles.fotoPlaceholder} />
        )}
      </Pressable>

      {/* Botão Carrinho à Direita */}
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
    width: "100%",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  tituloContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 40,
    bottom: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  titulo: {
    color: "#ffffff",
    fontSize: 32,
    textAlign: "center",
    includeFontPadding: false,
  },
  tituloComFonte: {
    fontFamily: "BerkshireSwash",
  },
  perfilBtn: {
    padding: 2,
    zIndex: 10,
  },
  foto: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
  },
  fotoPlaceholder: {
    width: 36,
    height: 36,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    opacity: 0.9,
  },
  carrinhoBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 10,
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