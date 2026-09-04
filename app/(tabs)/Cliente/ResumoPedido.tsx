import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../services/supabase";

export default function ResumoPedido() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    // Recuperando os parâmetros passados pela tela anterior
    const carrinho = params.carrinho ? JSON.parse(params.carrinho as string) : [];
    const endereco = params.endereco ? JSON.parse(params.endereco as string) : null;
    const metodoPagamento = params.metodoPagamento as string;
    const observacoes = params.observacoes as string;
    const valorTotal = Number(params.valorTotal) || 0;

    const finalizarPedido = async () => {
        try {
            setLoading(true);

            // 1. Pega o usuário logado atualmente
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Você precisa estar logado para finalizar o pedido.");
            }

            // 2. Insere o pedido na tabela do banco
            const { data: pedidoCriado, error: erroPedido } = await supabase
                .from("pedidos")
                .insert({
                    cliente_id: user.id,
                    status: "pendente",
                    metodo_pagamento: metodoPagamento,
                    observacoes: observacoes || "",
                    valor_total: valorTotal,
                    endereco_entrega: endereco,
                    itens: carrinho,
                })
                .select()
                .single();

            if (erroPedido) {
                throw new Error(`Erro ao criar pedido: ${erroPedido.message}`);
            }

            // 3. Validação baseada no método de pagamento escolhido
            if (metodoPagamento === "pix") {
                console.log("Chamando Edge Function de Pix para o pedido:", pedidoCriado.id);

                const { data: pixData, error: erroPix } = await supabase.functions.invoke(
                    "criar-pagamento-pix",
                    {
                        body: {
                            pedidoId: pedidoCriado.id,
                            valor: valorTotal,
                        },
                    }
                );

                console.log("Resposta da Edge Function Pix:", pixData);

                if (erroPix) {
                    throw new Error(erroPix.message || "Erro na comunicação com o servidor de pagamento.");
                }

                // Tenta pegar o copia e cola independente da variação do nome na API
                const codigoPix = pixData?.copiaECola || pixData?.qrCode || pixData?.qr_code;

                if (!codigoPix) {
                    throw new Error("A chave Pix (Copia e Cola) não foi retornada pelo servidor.");
                }

                // Redireciona para a tela de pagamento Pix passando os dados corretos
                router.push({
                    pathname: "/Cliente/PagamentoPix",
                    params: {
                        idPedido: pedidoCriado.id,
                        copiaECola: codigoPix,
                    },
                });
            } else {
                // Se for Dinheiro, Cartão na Entrega, etc.
                router.replace({
                    pathname: "/Cliente/PedidoConfirmado",
                    params: { idPedido: pedidoCriado.id },
                });
            }
        } catch (error: any) {
            console.error("Erro ao finalizar pedido:", error);
            Alert.alert("Atenção", error.message || "Ocorreu um erro inesperado ao finalizar o pedido.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.titulo}>Resumo do Pedido</Text>

            {/* Seção de Endereço */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="location-outline" size={20} color="#007AFF" />
                    <Text style={styles.cardTitle}>Endereço de Entrega</Text>
                </View>
                {endereco ? (
                    <Text style={styles.cardText}>
                        {endereco.rua}, {endereco.numero} - {endereco.bairro}
                    </Text>
                ) : (
                    <Text style={styles.cardText}>Nenhum endereço informado.</Text>
                )}
            </View>

            {/* Seção de Pagamento */}
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Ionicons name="card-outline" size={20} color="#007AFF" />
                    <Text style={styles.cardTitle}>Forma de Pagamento</Text>
                </View>
                <Text style={styles.cardText}>
                    {metodoPagamento ? metodoPagamento.toUpperCase() : "Não especificado"}
                </Text>
            </View>

            {/* Total do Pedido */}
            <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total a pagar:</Text>
                <Text style={styles.totalValue}>R$ {valorTotal.toFixed(2)}</Text>
            </View>

            {/* Botão de Finalizar */}
            <TouchableOpacity
                style={[styles.botaoFinalizar, loading && styles.botaoDisabled]}
                onPress={finalizarPedido}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.botaoTexto}>Confirmar e Finalizar</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#F8F9FA",
        flexGrow: 1,
    },
    titulo: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#333",
        textAlign: "center",
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
        color: "#333",
    },
    cardText: {
        fontSize: 14,
        color: "#666",
    },
    totalContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    totalValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#28A745",
    },
    botaoFinalizar: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
    },
    botaoDisabled: {
        backgroundColor: "#A0C4FF",
    },
    botaoTexto: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});