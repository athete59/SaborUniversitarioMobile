import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../../services/authContext";
import { supabase } from "../../../services/supabase";
import HeaderEmpresa from "./HeaderEmpresa";
import SideBarEmpresa from "./SideBarEmpresa";

interface ResumoMetricas {
  totalProdutos: number;
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosEntregues: number;
}

/**
 * Painel gerencial principal da Empresa na versão mobile enxuta.
 */
export default function DashboardEmpresa() {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [metricas, setMetricas] = useState<ResumoMetricas>({
    totalProdutos: 0,
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosEntregues: 0,
  });

  useEffect(() => {
    let isMounted = true;

    /**
     * Consulta o banco de dados Supabase para carregar os totais de produtos e pedidos da empresa.
     */
    async function carregarMetricas() {
      try {
        const empresaId = user?.perfil?.id;

        // 1. Contagem de produtos
        let queryProdutos = supabase
          .from("produtos")
          .select("*", { count: "exact", head: true });

        if (empresaId) {
          queryProdutos = queryProdutos.eq("idempresa", empresaId);
        }
        const { count: totalProdutos } = await queryProdutos;

        // 2. Consulta de pedidos
        const { data: pedidos, error: errPedidos } = await supabase
          .from("pedidos")
          .select("id, status");

        if (errPedidos) throw errPedidos;

        const total = pedidos ? pedidos.length : 0;
        const pendentes = pedidos
          ? pedidos.filter(
              (p) =>
                p.status?.toLowerCase() === "pendente" ||
                p.status?.toLowerCase() === "em preparo" ||
                p.status?.toLowerCase() === "pronto",
            ).length
          : 0;
        const entregues = pedidos
          ? pedidos.filter((p) => p.status?.toLowerCase() === "entregue").length
          : 0;

        if (isMounted) {
          setMetricas({
            totalProdutos: totalProdutos ?? 0,
            totalPedidos: total,
            pedidosPendentes: pendentes,
            pedidosEntregues: entregues,
          });
        }
      } catch (error) {
        console.log("Erro ao carregar dados do dashboard:", error);
        if (isMounted) {
          Alert.alert("Aviso", "Não foi possível sincronizar os dados do painel.");
        }
      } finally {
        if (isMounted) {
          setCarregando(false);
        }
      }
    }

    carregarMetricas();

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * Dispara a sincronização manual dos dados do painel via gesto de arrastar para baixo.
   */
  const onRefresh = async () => {
    setAtualizando(true);
    try {
      const empresaId = user?.perfil?.id;

      let queryProdutos = supabase
        .from("produtos")
        .select("*", { count: "exact", head: true });

      if (empresaId) {
        queryProdutos = queryProdutos.eq("idempresa", empresaId);
      }
      const { count: totalProdutos } = await queryProdutos;

      const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, status");

      const total = pedidos ? pedidos.length : 0;
      const pendentes = pedidos
        ? pedidos.filter(
            (p) =>
              p.status?.toLowerCase() === "pendente" ||
              p.status?.toLowerCase() === "em preparo" ||
              p.status?.toLowerCase() === "pronto",
          ).length
        : 0;
      const entregues = pedidos
        ? pedidos.filter((p) => p.status?.toLowerCase() === "entregue").length
        : 0;

      setMetricas({
        totalProdutos: totalProdutos ?? 0,
        totalPedidos: total,
        pedidosPendentes: pendentes,
        pedidosEntregues: entregues,
      });
    } catch (error) {
      console.log("Erro ao atualizar dados do dashboard:", error);
    } finally {
      setAtualizando(false);
    }
  };

  const nomeEmpresa =
    user?.nome || user?.perfil?.nome || "Empresa Parceira";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <HeaderEmpresa onPressMenu={() => setSidebarAberta(true)} />

      <SideBarEmpresa
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={onRefresh}
            colors={["#FA8006"]}
            tintColor="#FA8006"
          />
        }
      >
        {/* Banner de Boas-vindas */}
        <View style={styles.bannerBoasVindas}>
          <Text style={styles.saudacao}>Bem-vindo,</Text>
          <Text style={styles.nomeEmpresa} numberOfLines={1}>
            {nomeEmpresa}
          </Text>
        </View>

        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FA8006" />
            <Text style={styles.loadingText}>Carregando indicadores...</Text>
          </View>
        ) : (
          <>
            {/* Indicadores / Cards de Métricas */}
            <Text style={styles.secaoTitulo}>Visão Geral</Text>
            <View style={styles.gridMetricas}>
              <View style={styles.cardMetrica}>
                <View
                  style={[styles.iconeContainer, { backgroundColor: "#FFF2E6" }]}
                >
                  <MaterialIcons
                    name="restaurant-menu"
                    size={26}
                    color="#FA8006"
                  />
                </View>
                <Text style={styles.valorMetrica}>
                  {metricas.totalProdutos}
                </Text>
                <Text style={styles.labelMetrica}>Produtos Cadastrados</Text>
              </View>

              <View style={styles.cardMetrica}>
                <View
                  style={[styles.iconeContainer, { backgroundColor: "#EBF3FF" }]}
                >
                  <Feather name="shopping-bag" size={24} color="#2A75D3" />
                </View>
                <Text style={styles.valorMetrica}>{metricas.totalPedidos}</Text>
                <Text style={styles.labelMetrica}>Total de Pedidos</Text>
              </View>

              <View style={styles.cardMetrica}>
                <View
                  style={[styles.iconeContainer, { backgroundColor: "#FFF7E0" }]}
                >
                  <Feather name="clock" size={24} color="#E0A100" />
                </View>
                <Text style={styles.valorMetrica}>
                  {metricas.pedidosPendentes}
                </Text>
                <Text style={styles.labelMetrica}>Pedidos em Aberto</Text>
              </View>

              <View style={styles.cardMetrica}>
                <View
                  style={[styles.iconeContainer, { backgroundColor: "#EAF9ED" }]}
                >
                  <Feather name="check-circle" size={24} color="#27AE60" />
                </View>
                <Text style={styles.valorMetrica}>
                  {metricas.pedidosEntregues}
                </Text>
                <Text style={styles.labelMetrica}>Pedidos Concluídos</Text>
              </View>
            </View>

            {/* Ações Rápidas */}
            <Text style={styles.secaoTitulo}>Ações Rápidas</Text>
            <View style={styles.containerAcoes}>
              <TouchableOpacity
                style={styles.botaoAcao}
                activeOpacity={0.7}
                onPress={() =>
                  router.push("/(tabs)/Empresa/CadastrarProduto" as any)
                }
              >
                <View style={styles.iconeAcao}>
                  <Feather name="plus-circle" size={22} color="#FA8006" />
                </View>
                <View style={styles.textoAcaoContainer}>
                  <Text style={styles.tituloAcao}>Cadastrar Novo Produto</Text>
                  <Text style={styles.descAcao}>
                    Adicione pratos, bebidas ou lanches ao cardápio
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoAcao}
                activeOpacity={0.7}
                onPress={() =>
                  router.push("/(tabs)/Empresa/FormasPagamento" as any)
                }
              >
                <View style={styles.iconeAcao}>
                  <Feather name="credit-card" size={22} color="#FA8006" />
                </View>
                <View style={styles.textoAcaoContainer}>
                  <Text style={styles.tituloAcao}>Formas de Pagamento</Text>
                  <Text style={styles.descAcao}>
                    Configure os métodos que seus clientes podem utilizar
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoAcao}
                activeOpacity={0.7}
                onPress={() =>
                  router.push("/(tabs)/Empresa/FormasRecebimento" as any)
                }
              >
                <View style={styles.iconeAcao}>
                  <Feather name="dollar-sign" size={22} color="#FA8006" />
                </View>
                <View style={styles.textoAcaoContainer}>
                  <Text style={styles.tituloAcao}>Formas de Recebimento</Text>
                  <Text style={styles.descAcao}>
                    Cadastre suas chaves PIX e contas para recebimentos
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerBoasVindas: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 5,
    borderLeftColor: "#FA8006",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  saudacao: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "500",
  },
  nomeEmpresa: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
    marginTop: 2,
  },
  subtituloBanner: {
    fontSize: 13,
    color: "#FA8006",
    marginTop: 4,
    fontWeight: "600",
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 14,
  },
  gridMetricas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
    marginBottom: 24,
  },
  cardMetrica: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconeContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  valorMetrica: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222222",
  },
  labelMetrica: {
    fontSize: 12,
    color: "#777777",
    textAlign: "center",
    marginTop: 4,
  },
  containerAcoes: {
    gap: 12,
  },
  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconeAcao: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF2E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textoAcaoContainer: {
    flex: 1,
  },
  tituloAcao: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
  },
  descAcao: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777777",
  },
});
