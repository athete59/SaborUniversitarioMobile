import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuth } from "../../../services/authContext";
import { supabase } from "../../../services/supabase";
import Header from "./Header";
import Sidebar from "./SideBar";

interface ItemPedido {
  id: number;
  idproduto: number;
  quantidade: number;
  preco_unitario: number;
  produtos?: {
    nome: string;
    imagem?: string;
  };
}

interface Pedido {
  id: number;
  idcliente: number;
  valortotal: number;
  status: string;
  forma_pagamento: string;
  data_pedido: string;
  pedidos_produtos?: ItemPedido[];
}

/**
 * Tela que lista o histórico de pedidos do cliente com geração de QR Code para retirada no balcão.
 */
export default function MeusPedidos() {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);
  const [modalQrVisivel, setModalQrVisivel] = useState(false);

  useEffect(() => {
    let isMounted = true;

    /**
     * Consulta os pedidos do cliente logado no Supabase de forma resiliente.
     */
    async function buscarPedidos() {
      const idPerfil = user?.perfil?.id;
      const idUsuario = user?.id;

      if (!idPerfil && !idUsuario) {
        if (isMounted) setCarregando(false);
        return;
      }

      try {
        // 1. Busca os registros da tabela 'pedidos' de forma direta e compatível
        let query = supabase.from("pedidos").select("*");

        if (idPerfil && idUsuario && idPerfil !== idUsuario) {
          query = query.or(`idcliente.eq.${idPerfil},idcliente.eq.${idUsuario}`);
        } else if (idPerfil) {
          query = query.eq("idcliente", idPerfil);
        } else if (idUsuario) {
          query = query.eq("idcliente", idUsuario);
        }

        const { data: pedidosData, error: erroPedidos } = await query.order("id", {
          ascending: false,
        });

        if (erroPedidos) {
          console.log("Erro ao consultar tabela pedidos:", erroPedidos);
          throw erroPedidos;
        }

        if (!pedidosData || pedidosData.length === 0) {
          if (isMounted) setPedidos([]);
          return;
        }

        // 2. Busca itens na tabela pedidos_produtos de forma isolada
        const idsPedidos = pedidosData.map((p: any) => p.id);
        let itensData: any[] = [];
        try {
          const { data: itensRes } = await supabase
            .from("pedidos_produtos")
            .select("*")
            .in("idpedido", idsPedidos);
          if (itensRes) itensData = itensRes;
        } catch (e) {
          console.log("Aviso ao buscar itens de pedidos_produtos:", e);
        }

        // 3. Busca os produtos associados
        const produtosMap = new Map<number, { nome: string; imagem?: string }>();
        const idsProdutos = [
          ...new Set(itensData.map((it: any) => it.idproduto).filter(Boolean)),
        ];

        if (idsProdutos.length > 0) {
          try {
            const { data: produtosRes } = await supabase
              .from("produtos")
              .select("id, nome, imagem")
              .in("id", idsProdutos);

            if (produtosRes) {
              produtosRes.forEach((prod: any) => produtosMap.set(prod.id, prod));
            }
          } catch (e) {
            console.log("Aviso ao buscar dados dos produtos:", e);
          }
        }

        // 4. Constrói a lista final normalizando nomes de colunas do banco
        const pedidosFormatados: Pedido[] = pedidosData.map((p: any) => {
          const itensDoPedido = itensData
            .filter((it: any) => it.idpedido === p.id)
            .map((it: any) => ({
              id: it.id,
              idproduto: it.idproduto,
              quantidade: it.quantidade || 1,
              preco_unitario: Number(it.preco_unitario ?? it.preco ?? 0),
              produtos: produtosMap.get(it.idproduto) || {
                nome: "Item do Pedido",
              },
            }));

          return {
            id: p.id,
            idcliente: p.idcliente,
            valortotal: Number(p.valortotal ?? p.valor_total ?? 0),
            status: p.status || "Em preparo",
            forma_pagamento: String(p.forma_pagamento || p.idforma_pagamento || "Não informado"),
            data_pedido: p.data_pedido || p.data_hora || p.created_at || "",
            pedidos_produtos: itensDoPedido,
          };
        });

        if (isMounted) {
          setPedidos(pedidosFormatados);
        }
      } catch (error) {
        console.log("Erro ao carregar pedidos:", error);
        if (isMounted) {
          Alert.alert("Erro", "Não foi possível carregar a lista de pedidos.");
        }
      } finally {
        if (isMounted) {
          setCarregando(false);
        }
      }
    }

    buscarPedidos();

    return () => {
      isMounted = false;
    };
  }, [user]);

  /**
   * Atualiza a lista de pedidos sob demanda pelo gesto de puxar para atualizar.
   */
  const onRefresh = async () => {
    setAtualizando(true);
    const idPerfil = user?.perfil?.id;
    const idUsuario = user?.id;

    if (idPerfil || idUsuario) {
      try {
        let query = supabase.from("pedidos").select("*");

        if (idPerfil && idUsuario && idPerfil !== idUsuario) {
          query = query.or(`idcliente.eq.${idPerfil},idcliente.eq.${idUsuario}`);
        } else if (idPerfil) {
          query = query.eq("idcliente", idPerfil);
        } else if (idUsuario) {
          query = query.eq("idcliente", idUsuario);
        }

        const { data: pedidosData } = await query.order("id", { ascending: false });

        if (pedidosData && pedidosData.length > 0) {
          const idsPedidos = pedidosData.map((p: any) => p.id);
          let itensData: any[] = [];
          try {
            const { data: itensRes } = await supabase
              .from("pedidos_produtos")
              .select("*")
              .in("idpedido", idsPedidos);
            if (itensRes) itensData = itensRes;
          } catch (e) {
            console.log("Aviso ao buscar itens:", e);
          }

          const produtosMap = new Map<number, { nome: string; imagem?: string }>();
          const idsProdutos = [
            ...new Set(itensData.map((it: any) => it.idproduto).filter(Boolean)),
          ];

          if (idsProdutos.length > 0) {
            try {
              const { data: produtosRes } = await supabase
                .from("produtos")
                .select("id, nome, imagem")
                .in("id", idsProdutos);
              if (produtosRes) {
                produtosRes.forEach((prod: any) => produtosMap.set(prod.id, prod));
              }
            } catch (e) {
              console.log("Aviso ao buscar produtos:", e);
            }
          }

          const pedidosFormatados: Pedido[] = pedidosData.map((p: any) => {
            const itensDoPedido = itensData
              .filter((it: any) => it.idpedido === p.id)
              .map((it: any) => ({
                id: it.id,
                idproduto: it.idproduto,
                quantidade: it.quantidade || 1,
                preco_unitario: Number(it.preco_unitario ?? it.preco ?? 0),
                produtos: produtosMap.get(it.idproduto) || {
                  nome: "Item do Pedido",
                },
              }));

            return {
              id: p.id,
              idcliente: p.idcliente,
              valortotal: Number(p.valortotal ?? p.valor_total ?? 0),
              status: p.status || "Em preparo",
              forma_pagamento: String(p.forma_pagamento || p.idforma_pagamento || "Não informado"),
              data_pedido: p.data_pedido || p.data_hora || p.created_at || "",
              pedidos_produtos: itensDoPedido,
            };
          });

          setPedidos(pedidosFormatados);
        } else {
          setPedidos([]);
        }
      } catch (error) {
        console.log("Erro ao atualizar pedidos:", error);
      }
    }
    setAtualizando(false);
  };

  /**
   * Abre o modal de exibição do QR Code referente ao pedido selecionado.
   * @param pedido Dados completos do pedido escolhido
   */
  const abrirQrCode = (pedido: Pedido) => {
    setPedidoSelecionado(pedido);
    setModalQrVisivel(true);
  };

  /**
   * Formata uma data no padrão legível brasileiro com data e horário.
   * @param dataIso String com data no formato ISO
   */
  const formatarData = (dataIso: string) => {
    if (!dataIso) return "";
    try {
      const data = new Date(dataIso);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dataIso;
    }
  };

  /**
   * Retorna os estilos e textos adequados para cada status do pedido.
   * @param status Status atual do pedido
   */
  const obterBadgeStatus = (status: string) => {
    const statusNormalizado = (status || "Em preparo").toLowerCase();

    if (statusNormalizado === "entregue") {
      return {
        bg: "#EAF9ED",
        text: "#27AE60",
        label: "Entregue",
        icone: "check-circle" as const,
      };
    }
    if (statusNormalizado === "pronto") {
      return {
        bg: "#EBF3FF",
        text: "#2A75D3",
        label: "Pronto para Retirada",
        icone: "clock" as const,
      };
    }
    if (statusNormalizado === "cancelado") {
      return {
        bg: "#FDEAEA",
        text: "#D9534F",
        label: "Cancelado",
        icone: "x-circle" as const,
      };
    }
    return {
      bg: "#FFF7E0",
      text: "#D97706",
      label: "Em Preparo",
      icone: "refresh-cw" as const,
    };
  };

  const qrUrl = pedidoSelecionado
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PEDIDO_${pedidoSelecionado.id}`
    : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Header
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <Sidebar
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
        <View style={styles.topoSecao}>
          <Text style={styles.tituloTela}>Meus Pedidos</Text>
          <Text style={styles.subtituloTela}>
            Apresente o QR Code no balcão para retirar seu lanche
          </Text>
        </View>

        {carregando ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FA8006" />
            <Text style={styles.loadingText}>Carregando seus pedidos...</Text>
          </View>
        ) : pedidos.length === 0 ? (
          <View style={styles.vazioContainer}>
            <MaterialIcons name="receipt-long" size={64} color="#CCCCCC" />
            <Text style={styles.vazioTitulo}>Nenhum pedido encontrado</Text>
            <Text style={styles.vazioTexto}>
              Você ainda não fez nenhum pedido no sistema.
            </Text>
            <TouchableOpacity
              style={styles.btnCardapio}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/Cliente/PaginaInicial" as any)}
            >
              <Text style={styles.btnCardapioTexto}>Ver Cardápio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listaPedidos}>
            {pedidos.map((pedido) => {
              const badge = obterBadgeStatus(pedido.status);
              const jaEntregue =
                pedido.status?.toLowerCase() === "entregue";

              return (
                <View key={pedido.id} style={styles.cardPedido}>
                  {/* Cabeçalho do Card */}
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.idPedido}>Pedido #{pedido.id}</Text>
                      <Text style={styles.dataPedido}>
                        {formatarData(pedido.data_pedido)}
                      </Text>
                    </View>

                    <View
                      style={[styles.badgeStatus, { backgroundColor: badge.bg }]}
                    >
                      <Feather
                        name={badge.icone}
                        size={14}
                        color={badge.text}
                        style={{ marginRight: 4 }}
                      />
                      <Text
                        style={[styles.badgeTexto, { color: badge.text }]}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Itens do Pedido */}
                  {pedido.pedidos_produtos &&
                    pedido.pedidos_produtos.length > 0 && (
                      <View style={styles.itensContainer}>
                        {pedido.pedidos_produtos.map((item) => (
                          <View key={item.id} style={styles.itemLinha}>
                            <Text style={styles.itemNome}>
                              {item.quantidade}x{" "}
                              {item.produtos?.nome || "Item do Pedido"}
                            </Text>
                            <Text style={styles.itemPreco}>
                              R${" "}
                              {Number(
                                item.preco_unitario * item.quantidade,
                              ).toFixed(2)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Rodapé do Card */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.formaPagamento}>
                        Pagamento: {pedido.forma_pagamento || "Não informado"}
                      </Text>
                      <Text style={styles.totalPedido}>
                        Total: R$ {Number(pedido.valortotal || 0).toFixed(2)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.btnQrCode,
                        jaEntregue && styles.btnQrCodeEntregue,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => abrirQrCode(pedido)}
                    >
                      <MaterialIcons
                        name="qr-code"
                        size={20}
                        color={jaEntregue ? "#777" : "#FFFFFF"}
                      />
                      <Text
                        style={[
                          styles.btnQrCodeTexto,
                          jaEntregue && styles.btnQrCodeTextoEntregue,
                        ]}
                      >
                        {jaEntregue ? "Ver Detalhes" : "QR Code"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal de Exibição do QR Code */}
      <Modal
        visible={modalQrVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalQrVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                Pedido #{pedidoSelecionado?.id}
              </Text>
              <TouchableOpacity
                onPress={() => setModalQrVisivel(false)}
                style={styles.modalFecharBtn}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {pedidoSelecionado?.status?.toLowerCase() === "entregue" ? (
              <View style={styles.avisoEntregueBox}>
                <Feather name="check-circle" size={32} color="#27AE60" />
                <Text style={styles.avisoEntregueTitulo}>
                  Pedido já Entregue
                </Text>
                <Text style={styles.avisoEntregueDesc}>
                  Este QR Code já foi lido e dado baixa pelo atendente no
                  momento da entrega.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.qrContainer}>
                  {qrUrl ? (
                    <Image
                      source={{ uri: qrUrl }}
                      style={styles.qrImagem}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>

                <Text style={styles.qrInstrucao}>
                  Apresente este QR Code no balcão da empresa para retirar seu
                  pedido.
                </Text>
              </>
            )}

            <View style={styles.modalResumo}>
              <Text style={styles.modalValor}>
                Total: R${" "}
                {Number(pedidoSelecionado?.valortotal || 0).toFixed(2)}
              </Text>
              <Text style={styles.modalPagamento}>
                Pagamento: {pedidoSelecionado?.forma_pagamento}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setModalQrVisivel(false)}
            >
              <Text style={styles.btnFecharModalTexto}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  topoSecao: {
    marginBottom: 16,
  },
  tituloTela: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222222",
  },
  subtituloTela: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#777777",
  },
  vazioContainer: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  vazioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444444",
    marginTop: 16,
  },
  vazioTexto: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  btnCardapio: {
    backgroundColor: "#FA8006",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnCardapioTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  listaPedidos: {
    gap: 16,
  },
  cardPedido: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
    marginBottom: 12,
  },
  idPedido: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },
  dataPedido: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  badgeStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: "600",
  },
  itensContainer: {
    marginBottom: 12,
    gap: 6,
  },
  itemLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemNome: {
    fontSize: 14,
    color: "#444444",
    flex: 1,
  },
  itemPreco: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 10,
  },
  formaPagamento: {
    fontSize: 12,
    color: "#888888",
  },
  totalPedido: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FA8006",
    marginTop: 2,
  },
  btnQrCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FA8006",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  btnQrCodeEntregue: {
    backgroundColor: "#E0E0E0",
  },
  btnQrCodeTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  btnQrCodeTextoEntregue: {
    color: "#666666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  modalFecharBtn: {
    padding: 4,
  },
  qrContainer: {
    width: 220,
    height: 220,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  qrImagem: {
    width: 200,
    height: 200,
  },
  qrInstrucao: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  modalResumo: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  modalValor: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FA8006",
  },
  modalPagamento: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  avisoEntregueBox: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  avisoEntregueTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#27AE60",
    marginTop: 10,
  },
  avisoEntregueDesc: {
    fontSize: 13,
    color: "#666666",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  btnFecharModal: {
    width: "100%",
    backgroundColor: "#222222",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnFecharModalTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
