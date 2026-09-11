import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuth } from "../../../services/authContext";
import { supabase } from "../../../services/supabase";

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

interface PedidoConsultado {
  id: number;
  idcliente: number;
  valortotal: number;
  status: string;
  forma_pagamento: string;
  data_pedido: string;
  pedidos_produtos?: ItemPedido[];
}

/**
 * Tela de scanner de QR Code e validação de pedidos para funcionários.
 */
export default function ScannerPedido() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const [modoEntrada, setModoEntrada] = useState<"camera" | "manual">("camera");
  const [codigoManual, setCodigoManual] = useState("");
  const [processando, setProcessando] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pedido, setPedido] = useState<PedidoConsultado | null>(null);
  const [dandoBaixa, setDandoBaixa] = useState(false);

  /**
   * Extrai o identificador numérico de um texto de QR Code ou digitação manual.
   * @param rawText Texto bruto lido da câmera ou digitado no input
   */
  const extrairIdPedido = (rawText: string): number | null => {
    const limpo = rawText.trim().replace(/^PEDIDO_/i, "").replace(/[^0-9]/g, "");
    const id = parseInt(limpo, 10);
    return isNaN(id) ? null : id;
  };

  /**
   * Consulta os dados completos do pedido e seus produtos associados no Supabase de forma desacoplada.
   * @param idPedido Identificador único do pedido
   */
  const buscarDetalhesPedido = async (idPedido: number) => {
    try {
      setProcessando(true);

      // 1. Busca o pedido na tabela pedidos
      const { data: pedidoData, error: pedidoError } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", idPedido)
        .maybeSingle();

      if (pedidoError) throw pedidoError;

      if (!pedidoData) {
        Alert.alert(
          "Pedido Não Encontrado",
          `Nenhum pedido foi localizado com o identificador #${idPedido}.`,
          [{ text: "OK", onPress: () => setScanned(false) }],
        );
        setPedido(null);
        return;
      }

      // 2. Busca os itens relacionados em pedidos_produtos
      const { data: itensData, error: itensError } = await supabase
        .from("pedidos_produtos")
        .select("*")
        .eq("idpedido", idPedido);

      if (itensError) {
        console.warn("Aviso ao buscar itens do pedido:", itensError);
      }

      const itens = (itensData as any[]) || [];
      const idsProdutos = itens
        .map((it: any) => it.idproduto)
        .filter(Boolean);

      // 3. Busca detalhes dos produtos vinculados
      let produtosMap: Record<number, { nome: string; imagem?: string }> = {};
      if (idsProdutos.length > 0) {
        const { data: produtosData } = await supabase
          .from("produtos")
          .select("id, nome, imagem")
          .in("id", idsProdutos);

        if (produtosData) {
          produtosMap = produtosData.reduce((acc: any, prod: any) => {
            acc[prod.id] = { nome: prod.nome, imagem: prod.imagem };
            return acc;
          }, {});
        }
      }

      // Monta a lista formatada de itens
      const itensFormatados: ItemPedido[] = itens.map((it: any) => ({
        id: it.id,
        idproduto: it.idproduto,
        quantidade: it.quantidade ?? 1,
        preco_unitario: Number(it.preco_unitario ?? it.precounitario ?? it.preco ?? 0),
        produtos: produtosMap[it.idproduto] || { nome: `Produto #${it.idproduto}` },
      }));

      // Normaliza dados do pedido tolerando variações de schema
      const pedidoFormatado: PedidoConsultado = {
        id: pedidoData.id,
        idcliente: pedidoData.idcliente,
        valortotal: Number(pedidoData.valortotal ?? pedidoData.valor_total ?? 0),
        status: pedidoData.status || "Pendente",
        forma_pagamento: pedidoData.forma_pagamento || pedidoData.idforma_pagamento || "Não informada",
        data_pedido: pedidoData.data_pedido || pedidoData.data_hora || pedidoData.created_at || "",
        pedidos_produtos: itensFormatados,
      };

      setPedido(pedidoFormatado);
    } catch (error: any) {
      console.log("Erro ao buscar pedido:", error);
      Alert.alert(
        "Erro",
        error?.message || "Ocorreu um erro ao consultar o pedido no sistema.",
        [{ text: "OK", onPress: () => setScanned(false) }],
      );
    } finally {
      setProcessando(false);
    }
  };

  /**
   * Handler engatilhado quando a câmera detecta e decodifica um QR Code.
   * @param result Objeto contendo os dados lidos do código de barras
   */
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned || processando) return;
    setScanned(true);

    const id = extrairIdPedido(data);
    if (!id) {
      Alert.alert("QR Code Inválido", "O formato do código lido não é um pedido válido.", [
        { text: "Tentar Novamente", onPress: () => setScanned(false) },
      ]);
      return;
    }

    buscarDetalhesPedido(id);
  };

  /**
   * Submete a busca por ID digitado manualmente pelo funcionário.
   */
  const handleBuscarManual = () => {
    if (!codigoManual.trim()) {
      Alert.alert("Atenção", "Digite o código ou número do pedido.");
      return;
    }

    const id = extrairIdPedido(codigoManual);
    if (!id) {
      Alert.alert("Formato Inválido", "Por favor, digite um número de pedido válido.");
      return;
    }

    buscarDetalhesPedido(id);
  };

  /**
   * Atualiza o status do pedido para 'Entregue' no Supabase dando baixa no atendimento.
   */
  const handleDarBaixa = async () => {
    if (!pedido) return;

    Alert.alert(
      "Confirmar Entrega",
      `Deseja confirmar a entrega dos itens do Pedido #${pedido.id}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: async () => {
            try {
              setDandoBaixa(true);

              const { error } = await supabase
                .from("pedidos")
                .update({ status: "Entregue" })
                .eq("id", pedido.id);

              if (error) throw error;

              Alert.alert(
                "Baixa Confirmada!",
                `O Pedido #${pedido.id} foi marcado como ENTREGUE com sucesso.`,
              );

              // Atualiza o estado local para refletir a baixa imediatamente
              setPedido((prev) => (prev ? { ...prev, status: "Entregue" } : null));
            } catch (error: any) {
              console.log("Erro ao dar baixa no pedido:", error);
              Alert.alert(
                "Erro",
                error?.message || "Não foi possível dar baixa no pedido.",
              );
            } finally {
              setDandoBaixa(false);
            }
          },
        },
      ],
    );
  };

  /**
   * Reseta a leitura para permitir escanear um novo pedido.
   */
  const handleNovoScan = () => {
    setPedido(null);
    setScanned(false);
    setCodigoManual("");
  };

  /**
   * Encerra a sessão do funcionário e retorna à tela de login.
   */
  const handleSair = () => {
    Alert.alert("Sair", "Deseja encerrar o acesso do funcionário?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/");
        },
      },
    ]);
  };

  const jaEntregue = pedido?.status?.toLowerCase() === "entregue";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Cabeçalho do Funcionário */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Painel do Atendimento</Text>
          <Text style={styles.headerTitulo}>
            {user?.nome ? `Olá, ${user.nome}` : "Funcionário"}
          </Text>
        </View>

        <TouchableOpacity style={styles.btnSairHeader} onPress={handleSair}>
          <Feather name="log-out" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Se nenhum pedido estiver selecionado, exibe a câmera ou entrada manual */}
          {!pedido ? (
            <View>
              {/* Abas Alternadoras: Câmera x Manual */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tabBotao,
                    modoEntrada === "camera" && styles.tabBotaoAtivo,
                  ]}
                  onPress={() => {
                    setModoEntrada("camera");
                    setScanned(false);
                  }}
                >
                  <Feather
                    name="camera"
                    size={18}
                    color={modoEntrada === "camera" ? "#FA8006" : "#777"}
                  />
                  <Text
                    style={[
                      styles.tabTexto,
                      modoEntrada === "camera" && styles.tabTextoAtivo,
                    ]}
                  >
                    Escanear QR Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabBotao,
                    modoEntrada === "manual" && styles.tabBotaoAtivo,
                  ]}
                  onPress={() => setModoEntrada("manual")}
                >
                  <Feather
                    name="edit-3"
                    size={18}
                    color={modoEntrada === "manual" ? "#FA8006" : "#777"}
                  />
                  <Text
                    style={[
                      styles.tabTexto,
                      modoEntrada === "manual" && styles.tabTextoAtivo,
                    ]}
                  >
                    Digitar Código
                  </Text>
                </TouchableOpacity>
              </View>

              {modoEntrada === "camera" ? (
                <View style={styles.cameraBox}>
                  {!permission ? (
                    <View style={styles.cameraAviso}>
                      <ActivityIndicator size="large" color="#FA8006" />
                      <Text style={styles.cameraAvisoTexto}>
                        Carregando permissões da câmera...
                      </Text>
                    </View>
                  ) : !permission.granted ? (
                    <View style={styles.cameraAviso}>
                      <Feather name="camera-off" size={48} color="#999" />
                      <Text style={styles.cameraAvisoTitulo}>
                        Acesso à câmera necessário
                      </Text>
                      <Text style={styles.cameraAvisoTexto}>
                        Permita o uso da câmera para ler os QR Codes dos clientes.
                      </Text>
                      <TouchableOpacity
                        style={styles.btnPermissao}
                        onPress={requestPermission}
                      >
                        <Text style={styles.btnPermissaoTexto}>
                          Conceder Permissão
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.cameraContainer}>
                      <CameraView
                        style={styles.camera}
                        barcodeScannerSettings={{
                          barcodeTypes: ["qr"],
                        }}
                        onBarcodeScanned={
                          scanned || processando ? undefined : handleBarcodeScanned
                        }
                      >
                        <View style={styles.overlayMascara}>
                          <View style={styles.miraQr} />
                          <Text style={styles.miraTexto}>
                            Aponte a câmera para o QR Code do pedido
                          </Text>
                        </View>
                      </CameraView>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.manualCard}>
                  <Text style={styles.manualTitulo}>Buscar por Código</Text>
                  <Text style={styles.manualSub}>
                    Informe o ID do pedido gerado no aplicativo do cliente:
                  </Text>

                  <TextInput
                    style={styles.inputManual}
                    placeholder="Ex: 42 ou PEDIDO_42"
                    placeholderTextColor="#999"
                    value={codigoManual}
                    onChangeText={setCodigoManual}
                    keyboardType="numeric"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    style={styles.btnBuscarManual}
                    onPress={handleBuscarManual}
                    disabled={processando}
                  >
                    {processando ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="search" size={18} color="#FFFFFF" />
                        <Text style={styles.btnBuscarManualTexto}>
                          Localizar Pedido
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            /* Detalhes do Pedido Escaneado */
            <View style={styles.detalhesContainer}>
              {/* Alerta de QR Code Já Utilizado / Pedido Entregue */}
              {jaEntregue ? (
                <View style={styles.bannerJaEntregue}>
                  <View style={styles.bannerIconeContainer}>
                    <Feather name="alert-triangle" size={28} color="#D9534F" />
                  </View>
                  <View style={styles.bannerTextoContainer}>
                    <Text style={styles.bannerTitulo}>
                      QR CODE JÁ UTILIZADO!
                    </Text>
                    <Text style={styles.bannerDesc}>
                      Este pedido já foi marcado como ENTREGUE anteriormente. Não
                      entregue itens duplicados.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.bannerPendente}>
                  <Feather name="clock" size={24} color="#D97706" />
                  <View style={styles.bannerTextoContainer}>
                    <Text style={styles.bannerPendenteTitulo}>
                      Pedido Aguardando Retirada
                    </Text>
                    <Text style={styles.bannerPendenteDesc}>
                      Confira os itens abaixo e entregue ao cliente.
                    </Text>
                  </View>
                </View>
              )}

              {/* Informações Gerais do Pedido */}
              <View style={styles.cardInfoPedido}>
                <View style={styles.linhaCabecalho}>
                  <Text style={styles.pedidoNumero}>Pedido #{pedido.id}</Text>
                  <View
                    style={[
                      styles.statusTag,
                      {
                        backgroundColor: jaEntregue ? "#EAF9ED" : "#FFF7E0",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagTexto,
                        { color: jaEntregue ? "#27AE60" : "#D97706" },
                      ]}
                    >
                      {pedido.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.infoTexto}>
                  Forma de Pagamento:{" "}
                  <Text style={styles.infoValor}>
                    {pedido.forma_pagamento || "Não informada"}
                  </Text>
                </Text>

                <Text style={styles.infoTexto}>
                  Valor Total:{" "}
                  <Text style={styles.infoValorDestaque}>
                    R$ {Number(pedido.valortotal || 0).toFixed(2)}
                  </Text>
                </Text>
              </View>

              {/* Lista de Produtos do Pedido */}
              <Text style={styles.secaoTitulo}>
                Produtos do Pedido ({pedido.pedidos_produtos?.length || 0})
              </Text>
              <View style={styles.cardProdutos}>
                {pedido.pedidos_produtos && pedido.pedidos_produtos.length > 0 ? (
                  pedido.pedidos_produtos.map((item, idx) => (
                    <View
                      key={item.id || idx}
                      style={[
                        styles.linhaItem,
                        idx > 0 && styles.linhaItemBorda,
                      ]}
                    >
                      <View style={styles.quantidadeBadge}>
                        <Text style={styles.quantidadeTexto}>
                          {item.quantidade}x
                        </Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemNome}>
                          {item.produtos?.nome || "Produto não identificado"}
                        </Text>
                        <Text style={styles.itemSub}>
                          Unitário: R${" "}
                          {Number(item.preco_unitario || 0).toFixed(2)}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        R${" "}
                        {Number(
                          (item.preco_unitario || 0) * (item.quantidade || 1),
                        ).toFixed(2)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.semItensTexto}>
                    Nenhum item vinculado encontrado neste registro.
                  </Text>
                )}
              </View>

              {/* Botões de Ação */}
              <View style={styles.acoesContainer}>
                {!jaEntregue ? (
                  <TouchableOpacity
                    style={styles.btnDarBaixa}
                    onPress={handleDarBaixa}
                    disabled={dandoBaixa}
                  >
                    {dandoBaixa ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Feather name="check" size={22} color="#FFFFFF" />
                        <Text style={styles.btnDarBaixaTexto}>
                          Dar Baixa no Pedido
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.boxBaixaJaRealizada}>
                    <Feather name="check-circle" size={20} color="#27AE60" />
                    <Text style={styles.textoBaixaRealizada}>
                      Baixa já realizada com sucesso
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.btnEscanearOutro}
                  onPress={handleNovoScan}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color="#222" />
                  <Text style={styles.btnEscanearOutroTexto}>
                    Escanear Outro Pedido
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  header: {
    backgroundColor: "#222222",
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerSub: {
    color: "#FA8006",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 2,
  },
  btnSairHeader: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E9ECEF",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabBotao: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabBotaoAtivo: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabTexto: {
    fontSize: 14,
    color: "#777777",
    fontWeight: "500",
  },
  tabTextoAtivo: {
    color: "#FA8006",
    fontWeight: "bold",
  },
  cameraBox: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  cameraContainer: {
    height: 380,
    width: "100%",
  },
  camera: {
    flex: 1,
  },
  overlayMascara: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  miraQr: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "#FA8006",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  miraTexto: {
    color: "#FFFFFF",
    marginTop: 20,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 30,
  },
  cameraAviso: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cameraAvisoTitulo: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
    marginTop: 14,
  },
  cameraAvisoTexto: {
    fontSize: 13,
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  btnPermissao: {
    backgroundColor: "#FA8006",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPermissaoTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  manualCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  manualTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  manualSub: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
    marginBottom: 16,
  },
  inputManual: {
    backgroundColor: "#F1F3F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#222222",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  btnBuscarManual: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FA8006",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  btnBuscarManualTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  detalhesContainer: {
    gap: 16,
  },
  bannerJaEntregue: {
    flexDirection: "row",
    backgroundColor: "#FFECEC",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#D9534F",
    alignItems: "center",
  },
  bannerIconeContainer: {
    marginRight: 12,
  },
  bannerTextoContainer: {
    flex: 1,
  },
  bannerTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#D9534F",
  },
  bannerDesc: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  bannerPendente: {
    flexDirection: "row",
    backgroundColor: "#FFF7E0",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#D97706",
    alignItems: "center",
    gap: 12,
  },
  bannerPendenteTitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#D97706",
  },
  bannerPendenteDesc: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardInfoPedido: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linhaCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
    marginBottom: 10,
  },
  pedidoNumero: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222222",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },
  infoTexto: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  infoValor: {
    fontWeight: "600",
    color: "#222222",
  },
  infoValorDestaque: {
    fontWeight: "bold",
    color: "#FA8006",
    fontSize: 16,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
  },
  cardProdutos: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linhaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  linhaItemBorda: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  quantidadeBadge: {
    backgroundColor: "#FFF2E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  quantidadeTexto: {
    color: "#FA8006",
    fontWeight: "bold",
    fontSize: 13,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
  },
  itemSub: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#444444",
  },
  semItensTexto: {
    fontSize: 13,
    color: "#999999",
    textAlign: "center",
    paddingVertical: 10,
  },
  acoesContainer: {
    gap: 12,
    marginTop: 8,
  },
  btnDarBaixa: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#27AE60",
    paddingVertical: 15,
    borderRadius: 10,
    gap: 8,
    shadowColor: "#27AE60",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnDarBaixaTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  boxBaixaJaRealizada: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF9ED",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  textoBaixaRealizada: {
    color: "#27AE60",
    fontWeight: "600",
    fontSize: 14,
  },
  btnEscanearOutro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#D9D9D9",
  },
  btnEscanearOutroTexto: {
    color: "#222222",
    fontWeight: "600",
    fontSize: 14,
  },
});
