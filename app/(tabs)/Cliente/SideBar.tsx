import {
  Gabriela_400Regular,
  useFonts as useGabriela,
} from "@expo-google-fonts/gabriela";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { useAuth } from "../../../services/authContext";

interface SideBarProps {
  sidebarAberta: boolean;
  setSidebarAberta: (aberta: boolean) => void;
}

const LARGURA_SIDEBAR = 260;
const { height: LARGURA_TELA_ALTURA } = Dimensions.get("window");

/**
 * Menu lateral deslizante para navegação do cliente.
 * @param props Propriedades de controle da visibilidade da barra lateral
 */
export default function SideBar({
  sidebarAberta,
  setSidebarAberta,
}: SideBarProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [animacaoLeft] = useState(() => new Animated.Value(-LARGURA_SIDEBAR));

  // Fonte "Gabriela" conforme utilizado na Web
  const [gabrielaLoaded] = useGabriela({
    Gabriela_400Regular,
  });

  // Animação de deslizar a sidebar
  useEffect(() => {
    Animated.timing(animacaoLeft, {
      toValue: sidebarAberta ? 0 : -LARGURA_SIDEBAR,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarAberta, animacaoLeft]);

  /**
   * Fecha o menu lateral e navega para a rota especificada.
   * @param rota Caminho de destino no expo-router
   */
  const navegarPara = (rota: string) => {
    setSidebarAberta(false);
    router.push(rota as any);
  };

  /**
   * Encerra a sessão do usuário e redireciona para a tela de login.
   */
  const handleSair = async () => {
    setSidebarAberta(false);
    try {
      await signOut();
    } catch (error) {
      console.log("Erro ao sair:", error);
    } finally {
      router.replace("/");
    }
  };

  if (!sidebarAberta) return null;

  return (
    <Modal
      transparent
      visible={sidebarAberta}
      animationType="none"
      onRequestClose={() => setSidebarAberta(false)}
    >
      <View style={styles.overlay}>
        {/* Clique fora para fechar a sidebar */}
        <TouchableWithoutFeedback onPress={() => setSidebarAberta(false)}>
          <View style={styles.areaFora} />
        </TouchableWithoutFeedback>

        {/* Container principal da Sidebar (.sidebar) */}
        <Animated.View style={[styles.sidebar, { left: animacaoLeft }]}>
          {/* Header (.sidebar-header) */}
          <View style={styles.sidebarHeader}>
            <View style={styles.fotoContainer}>
              {user?.perfil?.foto_url ? (
                <Image
                  source={{ uri: user.perfil.foto_url }}
                  style={styles.fotoImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.fotoPlaceholder} />
              )}
            </View>

            <Text
              style={[
                styles.nome,
                gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
              ]}
              numberOfLines={1}
            >
              {user?.nome || "Usuário"}
            </Text>
          </View>

          {/* Lista de Navegação (.sidebar ul li) */}
          <View style={styles.listaMenu}>
            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Cliente/PaginaInicial")}
            >
              <Text
                style={[
                  styles.textoItemMenu,
                  gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
                ]}
              >
                Início
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Cliente/MeuPerfil")}
            >
              <Text
                style={[
                  styles.textoItemMenu,
                  gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
                ]}
              >
                Minha Conta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Cliente/MeusPedidos")}
            >
              <Text
                style={[
                  styles.textoItemMenu,
                  gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
                ]}
              >
                Meus Pedidos
              </Text>
            </TouchableOpacity>

            {/* Opção para deslogar */}
            <TouchableOpacity
              style={[styles.itemMenu, styles.itemSair]}
              activeOpacity={0.7}
              onPress={handleSair}
            >
              <Text style={styles.textoItemSair}>Sair da Conta</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    flexDirection: "row",
  },
  areaFora: {
    flex: 1,
  },
  /* .sidebar do CSS */
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: LARGURA_SIDEBAR,
    height: LARGURA_TELA_ALTURA,
    backgroundColor: "#554A45", // background: #554A45
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
  /* .sidebar-header do CSS */
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  /* .sidebar .foto do CSS (70px x 70px, circular) */
  fotoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  fotoImg: {
    width: "100%",
    height: "100%",
  },
  fotoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  nome: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  fichas: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    textAlign: "center",
  },
  /* .sidebar ul do CSS */
  listaMenu: {
    width: "100%",
  },
  itemMenu: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  textoItemMenu: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  itemSair: {
    marginTop: 20,
    borderBottomWidth: 0,
    backgroundColor: "rgba(255, 77, 77, 0.15)",
    borderRadius: 8,
  },
  textoItemSair: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
