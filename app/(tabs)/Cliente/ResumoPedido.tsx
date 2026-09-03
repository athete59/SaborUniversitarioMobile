import React, { useState, useMemo } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Fontes
import {
    useFonts as useGabriela,
    Gabriela_400Regular,
} from "@expo-google-fonts/gabriela";
import {
    useFonts as useArbutusSlab,
    ArbutusSlab_400Regular,
} from "@expo-google-fonts/arbutus-slab";
import {
    useFonts as useBelanosima,
    Belanosima_400Regular,
    Belanosima_600SemiBold,
    Belanosima_700Bold,
} from "@expo-google-fonts/belanosima";

import Header from "./Header";
import Sidebar from "./SideBar";
import { supabase } from "../../../services/supabase";
import { useCartStore } from "../../stores/useCartStore";

const FORMAS_PAGAMENTO = ["Dinheiro", "Pix", "Cartão"];

export default function ResumoPedido() {
    const router = useRouter();

    const [gabrielaLoaded] = useGabriela({ Gabriela_400Regular });
    const [arbutusLoaded] = useArbutusSlab({ ArbutusSlab_400Regular });
    const [belanosimaLoaded] = useBelanosima({
        Belanosima_400Regular,
        Belanosima_600SemiBold,
        Belanosima_700Bold,
    });

    const [sidebarAberta, setSidebarAberta] = useState<boolean>(false);
    const [enviandoPedido, setEnviandoPedido] = useState<boolean>(false);
    const [formaPagamento, setFormaPagamento] = useState<string>("Dinheiro");
    const [modalPagamentoVisivel, setModalPagamentoVisivel] = useState<boolean>(false);

    // Consumo 100% Reativo do Zustand
    const itens = useCartStore((state) => state.carrinho);
    const alterarQuantidade = useCartStore((state) => state.alterarQuantidade);
    const limparCarrinho = useCartStore((state) => state.limparCarrinho);

    // Cálculo derivado reativo
    const total = useMemo(() => {
        return itens.reduce((soma, item) => {
            const precoNumerico =
                typeof item.preco === "string"
                    ? parseFloat(
                        item.preco
                            .replace("R$", "")
                            .replace(/\s/g, "")
                            .replace(".", "")
                            .replace(",", ".")
                    )
                    : Number(item.preco);

            return soma + (isNaN(precoNumerico) ? 0 : precoNumerico) * item.quantidade;
        }, 0);
    }, [itens]);

    async function confirmarPedido() {
        if (itens.length === 0) {
            Alert.alert("Aviso", "Seu carrinho está vazio.");
            return;
        }

        try {
            setEnviandoPedido(true);

            const usuarioLogadoJson = await AsyncStorage.getItem("usuario_logado");
            const usuarioLogado = usuarioLogadoJson ? JSON.parse(usuarioLogadoJson) : null;

            if (!usuarioLogado?.id) {
                Alert.alert("Erro", "Sessão expirada. Faça login novamente.");
                router.replace("/");
                return;
            }

            // 1. Grava o pedido no Supabase
            const { data: pedidoCriado, error: erroPedido } = await supabase
                .from("pedidos")
                .insert([
                    {
                        idcliente: usuarioLogado.id,
                        valortotal: total,
                        status: "Em preparo",
                        forma_pagamento: formaPagamento,
                        data_pedido: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (erroPedido) throw erroPedido;

            // 2. Grava os itens vinculados na tabela pedidos_produtos
            if (pedidoCriado?.id) {
                const itensParaInserir = itens.map((item) => ({
                    idpedido: pedidoCriado.id,
                    idproduto: item.id,
                    quantidade: item.quantidade,
                    preco_unitario:
                        typeof item.preco === "string"
                            ? parseFloat(
                                item.preco.replace("R$", "").replace(/\s/g, "").replace(".", "").replace(",", ".")
                            )
                            : item.preco,
                }));

                const { error: erroItens } = await supabase
                    .from("pedidos_produtos")
                    .insert(itensParaInserir);

                if (erroItens) {
                    console.warn("Erro ao vincular produtos ao pedido:", erroItens);
                }
            }

            // Limpa a store do Zustand
            limparCarrinho();

            router.push("/pedidofeito" as any);
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Não foi possível confirmar o pedido.");
        } finally {
            setEnviandoPedido(false);
        }
    }

    if (!gabrielaLoaded || !arbutusLoaded || !belanosimaLoaded) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#fa8006" />
            </SafeAreaView>
        );
    }

    if (itens.length === 0) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Header
                    sidebarAberta={sidebarAberta}
                    setSidebarAberta={setSidebarAberta}
                />
                <View style={styles.centerContainer}>
                    <Text style={styles.semPedidosTexto}>Nenhum item no carrinho</Text>
                    <TouchableOpacity
                        style={styles.btnVoltarCardapio}
                        onPress={() => router.replace("/(tabs)/Cliente/PaginaInicial" as any)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnVoltarCardapioTexto}>Voltar ao Cardápio</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Sidebar
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />

            <Header
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.titulo}>Restaurante Universitário</Text>

                <View style={styles.categoriaContainer}>
                    <Text style={styles.categoriaTexto}>Resumo do pedido</Text>
                </View>

                <View style={styles.cardProdutoBox}>
                    {itens.map((produto, index) => {
                        const precoNumerico =
                            typeof produto.preco === "string"
                                ? parseFloat(
                                    produto.preco
                                        .replace("R$", "")
                                        .replace(/\s/g, "")
                                        .replace(".", "")
                                        .replace(",", ".")
                                )
                                : Number(produto.preco);

                        const subtotalItem = (isNaN(precoNumerico) ? 0 : precoNumerico) * produto.quantidade;

                        return (
                            <View
                                style={styles.resumoItemLinha}
                                key={`resumo-${produto.id || index}`}
                            >
                                <View style={styles.resumoEsquerda}>
                                    {produto.imagem ? (
                                        <Image
                                            source={{ uri: produto.imagem }}
                                            style={styles.imgProduto}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={styles.imgProdutoFallback} />
                                    )}

                                    <View style={styles.infoProduto}>
                                        <Text style={styles.nomeProduto} numberOfLines={2}>
                                            {produto.nome}
                                        </Text>
                                        <Text style={styles.precoItem}>
                                            R$ {subtotalItem.toFixed(2).replace(".", ",")}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.controle}>
                                    <TouchableOpacity
                                        style={styles.controleBotao}
                                        onPress={() => alterarQuantidade(index, -1)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.controleBotaoTexto}>-</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.controleQuantidade}>
                                        {produto.quantidade}
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.controleBotao}
                                        onPress={() => alterarQuantidade(index, 1)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.controleBotaoTexto}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.totalContainer}>
                        <Text style={styles.totalTexto}>
                            Valor total: R$ {total.toFixed(2).replace(".", ",")}
                        </Text>
                    </View>
                </View>

                <View style={styles.resumoFooter}>
                    <TouchableOpacity
                        onPress={() => router.push("/(tabs)/Cliente/PaginaInicial" as any)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.linkAdicionarMais}>
                            Adicionar mais produtos ao carrinho
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.pagamentoLinha}>
                        <TouchableOpacity
                            style={styles.selectPagamento}
                            onPress={() => setModalPagamentoVisivel(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.selectTexto}>{formaPagamento}</Text>
                            <Text style={styles.selectSeta}>▼</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.btnComprar}
                            onPress={confirmarPedido}
                            disabled={enviandoPedido}
                            activeOpacity={0.85}
                        >
                            {enviandoPedido ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.btnComprarTexto}>PRÓXIMO</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Modal Pagamento */}
            <Modal
                visible={modalPagamentoVisivel}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalPagamentoVisivel(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalPagamentoVisivel(false)}
                >
                    <View style={styles.modalConteudo}>
                        <Text style={styles.modalTitulo}>Forma de Pagamento</Text>
                        {FORMAS_PAGAMENTO.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.modalItem,
                                    formaPagamento === item && styles.modalItemAtivo,
                                ]}
                                onPress={() => {
                                    setFormaPagamento(item);
                                    setModalPagamentoVisivel(false);
                                }}
                            >
                                <Text
                                    style={[
                                        styles.modalItemTexto,
                                        formaPagamento === item && styles.modalItemTextoAtivo,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#ececec",
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#ececec",
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    titulo: {
        fontFamily: "Gabriela_400Regular",
        fontSize: 28,
        color: "#fa8006",
        textAlign: "center",
        marginVertical: 20,
    },
    categoriaContainer: {
        backgroundColor: "#FFE7D2",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: "center",
        marginBottom: 16,
    },
    categoriaTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 18,
        color: "#F5670E",
    },
    cardProdutoBox: {
        backgroundColor: "#FF9C72",
        borderRadius: 20,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 20,
    },
    resumoItemLinha: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.35)",
    },
    resumoEsquerda: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 10,
    },
    imgProduto: {
        width: 65,
        height: 65,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginRight: 12,
    },
    imgProdutoFallback: {
        width: 65,
        height: 65,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginRight: 12,
    },
    infoProduto: {
        flex: 1,
    },
    nomeProduto: {
        fontFamily: "Belanosima_600SemiBold",
        fontSize: 17,
        color: "#FFFFFF",
        marginBottom: 4,
    },
    precoItem: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 15,
        color: "#FFFFFF",
    },
    controle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    controleBotao: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    controleBotaoTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 16,
        color: "#111111",
        fontWeight: "bold",
    },
    controleQuantidade: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 16,
        color: "#FFFFFF",
        minWidth: 20,
        textAlign: "center",
    },
    totalContainer: {
        marginTop: 14,
        paddingTop: 10,
        alignItems: "flex-end",
    },
    totalTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 18,
        color: "#FFFFFF",
    },
    resumoFooter: {
        alignItems: "center",
        marginTop: 4,
    },
    linkAdicionarMais: {
        fontFamily: "Belanosima_600SemiBold",
        color: "#F5670E",
        fontSize: 15,
        textDecorationLine: "underline",
        marginBottom: 20,
    },
    pagamentoLinha: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
    },
    selectPagamento: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 14,
        height: 52,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    selectTexto: {
        fontFamily: "Belanosima_600SemiBold",
        fontSize: 15,
        color: "#333333",
    },
    selectSeta: {
        fontSize: 12,
        color: "#777777",
    },
    btnComprar: {
        flex: 1,
        backgroundColor: "#ff6b2c",
        height: 52,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "rgba(0,0,0,0.18)",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
    },
    btnComprarTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        color: "#FFFFFF",
        fontSize: 16,
    },
    semPedidosTexto: {
        fontFamily: "Belanosima_600SemiBold",
        fontSize: 22,
        color: "#555555",
        marginBottom: 20,
    },
    btnVoltarCardapio: {
        backgroundColor: "#F5670E",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    btnVoltarCardapioTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        color: "#FFFFFF",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    modalConteudo: {
        backgroundColor: "#FFFFFF",
        width: "100%",
        borderRadius: 14,
        padding: 20,
        elevation: 6,
    },
    modalTitulo: {
        fontFamily: "Gabriela_400Regular",
        fontSize: 20,
        color: "#222222",
        marginBottom: 16,
        textAlign: "center",
    },
    modalItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
        alignItems: "center",
    },
    modalItemAtivo: {
        backgroundColor: "#FFE7D2",
        borderRadius: 8,
    },
    modalItemTexto: {
        fontFamily: "Belanosima_400Regular",
        fontSize: 16,
        color: "#444444",
    },
    modalItemTextoAtivo: {
        fontFamily: "Belanosima_700Bold",
        color: "#F5670E",
    },
});