import {
    BerkshireSwash_400Regular,
    useFonts,
} from "@expo-google-fonts/berkshire-swash";
import { useRouter } from "expo-router";
import React from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface SidebarProps {
  sidebarAberta: boolean;
  setSidebarAberta: (aberta: boolean) => void;
  nomeUsuario?: string;
  fichas?: number;
}

export default function Sidebar({
  sidebarAberta,
  setSidebarAberta,
  nomeUsuario = "Emanuel Reis",
  fichas = 5,
}: SidebarProps) {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
  });

  function navegarPara(rota: string) {
    setSidebarAberta(false);
    router.push(rota as any);
  }

  return (
    <Modal
      visible={sidebarAberta}
      transparent
      animationType="fade"
      onRequestClose={() => setSidebarAberta(false)}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => setSidebarAberta(false)}
        />

        <SafeAreaView style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.foto} />
            <Text style={styles.nome}>{nomeUsuario}</Text>
            <Text style={styles.fichas}>Fichas: {fichas}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.lista}>
            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressionado,
              ]}
              onPress={() => navegarPara("/(tabs)/Cliente/PaginaInicial")}
            >
              <Text style={styles.itemTexto}>Início</Text>
            </Pressable>

            <View style={styles.linhaSeparadora} />

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressionado,
              ]}
              onPress={() => navegarPara("/(tabs)/explore")}
            >
              <Text style={styles.itemTexto}>Minha Conta</Text>
            </Pressable>

            <View style={styles.linhaSeparadora} />

            <Pressable
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressionado,
              ]}
              onPress={() => navegarPara("/modal")}
            >
              <Text style={styles.itemTexto}>Meus Pedidos</Text>
            </Pressable>

            <View style={styles.linhaSeparadora} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sidebar: {
    width: 250,
    height: "100%",
    backgroundColor: "#554A45", // Cor exata da versão Web
    paddingHorizontal: 20,
    paddingTop: 40,
    elevation: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  foto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  nome: {
    color: "#FFFFFF",
    fontFamily: "BerkshireSwash",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 4,
  },
  fichas: {
    color: "#FFFFFF",
    fontFamily: "BerkshireSwash",
    fontSize: 14,
    opacity: 0.9,
    textAlign: "center",
  },
  divisor: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: 10,
  },
  lista: {
    width: "100%",
  },
  item: {
    paddingVertical: 14,
  },
  itemPressionado: {
    opacity: 0.7,
  },
  itemTexto: {
    color: "#FFFFFF",
    fontFamily: "BerkshireSwash",
    fontSize: 16,
  },
  linhaSeparadora: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
