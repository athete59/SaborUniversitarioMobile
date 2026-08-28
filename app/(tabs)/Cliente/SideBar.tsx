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

import { supabase } from "../../../services/supabase";

interface SideBarProps {
  sidebarAberta: boolean;
  setSidebarAberta: (aberta: boolean) => void;
}

interface Cliente {
  nome?: string;
  fichas?: number;
  foto_url?: string;
}

const LARGURA_SIDEBAR = 260;
const { height: LARGURA_TELA_ALTURA } = Dimensions.get("window");

export default function SideBar({
  sidebarAberta,
  setSidebarAberta,
}: SideBarProps) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [animacaoLeft] = useState(new Animated.Value(-LARGURA_SIDEBAR));

  // Fonte "Gabriela" conforme utilizado na Web
  const [gabrielaLoaded] = useGabriela({
    Gabriela_400Regular,
  });

  // Busca dados do usuário/cliente logado no Supabase
  useEffect(() => {
    async function carregarCliente() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("clientes")
            .select("nome, fichas, foto_url")
            .eq("id_usuario", user.id)
            .single();

          if (data && !error) {
            setCliente(data);
          }
        }
      } catch (err) {
        console.log("Erro ao carregar dados do cliente no SideBar:", err);
      }
    }

    carregarCliente();
  }, []);

  // Animação de deslizar a sidebar (equivalente ao left: -300px -> left: 0 no CSS)
  useEffect(() => {
    Animated.timing(animacaoLeft, {
      toValue: sidebarAberta ? 0 : -LARGURA_SIDEBAR,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [sidebarAberta]);

  const navegarPara = (rota: string) => {
    setSidebarAberta(false);
    router.push(rota as any);
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
              {cliente?.foto_url ? (
                <Image
                  source={{ uri: cliente.foto_url }}
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
              {cliente?.nome || "Usuário"}
            </Text>

            <Text
              style={[
                styles.fichas,
                gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
              ]}
            >
              Fichas: {cliente?.fichas ?? 0}
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
  /* .sidebar ul li do CSS */
  itemMenu: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.2)", // border-bottom: 1px solid rgba(255,255,255,0.2)
  },
  textoItemMenu: {
    color: "#FFFFFF",
    fontSize: 18,
  },
});
