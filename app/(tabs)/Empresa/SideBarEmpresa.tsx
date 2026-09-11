import {
  Gabriela_400Regular,
  useFonts as useGabriela,
} from "@expo-google-fonts/gabriela";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { supabase } from "../../../services/supabase";

interface SideBarEmpresaProps {
  sidebarAberta: boolean;
  setSidebarAberta: (aberta: boolean) => void;
}

interface Empresa {
  nome?: string;
  foto_url?: string;
}

const LARGURA_SIDEBAR = 260;
const { height: LARGURA_TELA_ALTURA } = Dimensions.get("window");

export default function SideBarEmpresa({
  sidebarAberta,
  setSidebarAberta,
}: SideBarEmpresaProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [animacaoLeft] = useState(new Animated.Value(-LARGURA_SIDEBAR));

  const [gabrielaLoaded] = useGabriela({
    Gabriela_400Regular,
  });

  useEffect(() => {
    async function carregarEmpresa() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("empresas")
            .select("nome, foto_url")
            .eq("id_usuario", user.id)
            .single();

          if (data && !error) {
            setEmpresa(data);
          }
        }
      } catch (err) {
        console.log("Erro ao carregar dados da empresa na SideBar:", err);
      }
    }

    carregarEmpresa();
  }, []);

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

  const handleSair = async () => {
    setSidebarAberta(false);
    try {
      // Limpa os dados salvos do usuário
      await AsyncStorage.removeItem("usuario_logado");
      if (signOut) {
        await signOut();
      }
    } catch (error) {
      console.log("Erro ao encerrar sessão:", error);
    } finally {
      // Redireciona para a tela inicial de Login (index.tsx)
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
              {empresa?.foto_url ? (
                <Image
                  source={{ uri: empresa.foto_url }}
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
              {empresa?.nome || "Empresa Fulana"}
            </Text>
          </View>

          {/* Lista do Menu da Empresa */}
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
              onPress={() => navegarPara("/(tabs)/Empresa/Funcionarios")}
            >
              <Text style={styles.textoItemMenu}>Funcionários</Text>
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
              onPress={() => navegarPara("/(tabs)/Empresa/Categorias")}
            >
              <Text style={styles.textoItemMenu}>Categorias</Text>
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
              onPress={() => navegarPara("/(tabs)/Empresa/TelaTipoRecebimento")}
            >
              <Text style={styles.textoItemMenu}>Formas de Recebimento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.itemMenu}
              activeOpacity={0.7}
              onPress={() => navegarPara("/(tabs)/Empresa/Beneficios")}
            >
              <Text style={styles.textoItemMenu}>Benefícios</Text>
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
