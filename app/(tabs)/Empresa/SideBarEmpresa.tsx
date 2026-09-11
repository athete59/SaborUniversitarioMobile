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

interface SideBarEmpresaProps {
  sidebarAberta: boolean;
  setSidebarAberta: (aberta: boolean) => void;
}

const LARGURA_SIDEBAR = 260;
const { height: LARGURA_TELA_ALTURA } = Dimensions.get("window");

/**
 * Menu lateral deslizante para navegação da Empresa (versão mobile enxuta).
 * @param props Propriedades de controle da visibilidade da barra lateral
 */
export default function SideBarEmpresa({
  sidebarAberta,
  setSidebarAberta,
}: SideBarEmpresaProps) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [animacaoLeft] = useState(() => new Animated.Value(-LARGURA_SIDEBAR));

  const [gabrielaLoaded] = useGabriela({
    Gabriela_400Regular,
  });

  useEffect(() => {
    Animated.timing(animacaoLeft, {
      toValue: sidebarAberta ? 0 : -LARGURA_SIDEBAR,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarAberta, animacaoLeft]);

  /**
   * Fecha o menu lateral e navega para a rota especificada da empresa.
   * @param rota Rota de navegação no expo-router
   */
  const navegarPara = (rota: string) => {
    setSidebarAberta(false);
    router.push(rota as any);
  };

  /**
   * Encerra a sessão corporativa e redireciona para a tela inicial.
   */
  const handleSair = async () => {
    setSidebarAberta(false);
    try {
      await signOut();
    } catch (error) {
      console.log("Erro ao encerrar sessão:", error);
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
        <TouchableWithoutFeedback onPress={() => setSidebarAberta(false)}>
          <View style={styles.areaFora} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sidebar, { left: animacaoLeft }]}>
          {/* Header da Sidebar */}
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
              {user?.nome || user?.perfil?.nome || "Empresa"}
            </Text>
          </View>

          {/* Lista do Menu da Empresa Enxuto */}
          <View style={styles.listaMenu}>
            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Empresa/Dashboard")}
            >
              <Text style={styles.textoItemMenu}>Dashboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Empresa/CadastrarProduto")}
            >
              <Text style={styles.textoItemMenu}>Produtos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Empresa/FormasPagamento")}
            >
              <Text style={styles.textoItemMenu}>Formas de Pagamento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Empresa/FormasRecebimento")}
            >
              <Text style={styles.textoItemMenu}>Formas de Recebimento</Text>
            </TouchableOpacity>

            {/* Opção para deslogar da conta */}
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
  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: LARGURA_SIDEBAR,
    height: LARGURA_TELA_ALTURA,
    backgroundColor: "#554A45",
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
  sidebarHeader: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
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
  },
  listaMenu: {
    width: "100%",
  },
  itemMenu: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
  },
  textoItemMenu: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
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
