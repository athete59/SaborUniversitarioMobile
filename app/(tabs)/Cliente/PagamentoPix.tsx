import React, { useState, useEffect, useMemo } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fontes configuradas no projeto
import {
    useFonts as useBerkshire,
    BerkshireSwash_400Regular,
} from "@expo-google-fonts/berkshire-swash";
import {
    useFonts as useArbutusSlab,
    ArbutusSlab_400Regular,
} from "@expo-google-fonts/arbutus-slab";
import {
    useFonts as useGabriela,
    Gabriela_400Regular,
} from "@expo-google-fonts/gabriela";

import { supabase } from "../../../services/supabase";

export default function PagamentoPix() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ idPedido: string; valorTotal: string }>();

    const idPedido = params.idPedido || "0";
    const valorTotal = params.valorTotal || "0.00";

    const [berkshireLoaded] = useBerkshire({ BerkshireSwash_400Regular });
    const [arbutusLoaded] = useArbutusSlab({ ArbutusSlab_400Regular });
    const [gabrielaLoaded] = useGabriela({ Gabriela_400Regular });

    const [copiado, setCopiado] = useState(false);
    const [pago, setPago] = useState(false);

    // String padrão EMV Pix Copia e Cola (simulada vinculada ao ID do pedido)
    const codigoPixCopiaECola = useMemo(() => {
        return `00020101021126580014br.gov.bcb.pix013631597ff4-c90e-470b-b8d6-b767f1f85a1e5204000053039865802BR5915RestauranteUni6013RIO DE JANEIRO62070503***630436C2-PEDIDO-${idPedido}`;
    }, [idPedido]);

    // Calcula validade de 15 minutos a partir da abertura
    const horarioValidade = useMemo(() => {
        const agora = new Date();
        agora.setMinutes(agora.getMinutes() + 15);
        const horas = String(agora.getHours()).padStart(2, "0");
        const minutos = String(agora.getMinutes()).padStart(2, "0");
        return `${horas}h${minutos}`;
    }, []);

    // Escuta em tempo real no Supabase a confirmação de pagamento
    useEffect(() => {
        if (!idPedido || idPedido === "0") return;

        const canal = supabase
            .channel(`pedido_${idPedido}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "pedidos",
                    filter: `id=eq.${idPedido}`,
                },
                (payload: any) => {
                    if (payload.new && payload.new.status !== "Pendente") {
                        setPago(true);
                        setTimeout(() => {
                            router.replace("/pedidofeito" as any);
                        }, 1800);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(canal);
        };
    }, [idPedido, router]);

    async function copiarCodigo() {
        await Clipboard.setStringAsync(codigoPixCopiaECola);
        setCopiado(true);
        Alert.alert("Código Copiado!", "Cole no aplicativo do seu banco para pagar.");
        setTimeout(() => setCopiado(false), 3000);
    }

    // Simulação manual de pagamento (útil para testes antes da Edge Function / Webhook da API estar no ar)
    async function simularPagamentoAprovado() {
        try {
            await supabase
                .from("pedidos")
                .update({ status: "Em preparo" })
                .eq("id", idPedido);

            setPago(true);
            setTimeout(() => {
                router.replace("/pedidofeito" as any);
            }, 1200);
        } catch (err: any) {
            Alert.alert("Erro", "Não foi possível atualizar o pedido.");
        }
    }

    if (!berkshireLoaded || !arbutusLoaded || !gabrielaLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Faixa Superior com Título Principal */}
                <View style={[styles.faixaLaranja, { paddingTop: Math.max(insets.top, 12) + 12 }]}>
                    <Text style={styles.tituloHeader}>Sabor Universitário</Text>
                </View>

                {/* Barra de Subtítulo com Botão Voltar */}
                <View style={styles.barraSubtitulo}>
                    <TouchableOpacity
                        style={styles.btnVoltar}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.setaVoltar}>←</Text>
                        <Text style={styles.textoVoltar}>Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.subtituloRestaurante}>Restaurante universitário</Text>
                </View>

                {/* Card Principal Pêssego */}
                <View style={styles.cardPix}>
                    {/* Badge Pagamento Realizado */}
                    <TouchableOpacity
                        style={[styles.badgeStatus, pago && styles.badgeStatusPago]}
                        onPress={simularPagamentoAprovado}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.badgeTexto}>
                            {pago ? "Pagamento confirmado ✓" : "Pagamento realizado ✓"}
                        </Text>
                    </TouchableOpacity>

                    {/* Título PIX */}
                    <Text style={styles.tituloPix}>PIX</Text>

                    {/* Linha Central: QR Code + Texto Instrução */}
                    <View style={styles.conteudoCentral}>
                        <View style={styles.qrCodeWrapper}>
                            <QRCode
                                value={codigoPixCopiaECola}
                                size={160}
                                color="#000000"
                                backgroundColor="#FFFFFF"
                            />
                        </View>

                        <Text style={styles.instrucaoTexto}>
                            Aponte a sua câmera para o qr code ao lado ou use o código abaixo do pix copia e cola.
                        </Text>
                    </View>

                    {/* Validade */}
                    <Text style={styles.validadeTexto}>Pix válido até {horarioValidade}</Text>

                    {/* Caixa do Código Copia e Cola */}
                    <View style={styles.boxChavePix}>
                        <Text style={styles.textoChavePix} numberOfLines={3} ellipsizeMode="middle">
                            {codigoPixCopiaECola}
                        </Text>
                    </View>

                    {/* Botão Copiar */}
                    <TouchableOpacity
                        style={[styles.btnCopiar, copiado && styles.btnCopiado]}
                        onPress={copiarCodigo}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnCopiarTexto}>
                            {copiado ? "Código copiado!" : "Copiar código pix"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 28,
    },
    faixaLaranja: {
        backgroundColor: "#FF7124",
        paddingBottom: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    tituloHeader: {
        fontFamily: "BerkshireSwash",
        fontSize: 28,
        color: "#FFFFFF",
        includeFontPadding: false,
    },
    barraSubtitulo: {
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    btnVoltar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    setaVoltar: {
        fontSize: 22,
        color: "#FF7124",
        fontWeight: "bold",
    },
    textoVoltar: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 18,
        color: "#FF7124",
        includeFontPadding: false,
    },
    subtituloRestaurante: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 16,
        color: "#F5670E",
        includeFontPadding: false,
    },
    cardPix: {
        backgroundColor: "#F8E2CC",
        marginHorizontal: 16,
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
    },
    badgeStatus: {
        alignSelf: "flex-start",
        backgroundColor: "#F2B895",
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 14,
        marginBottom: 8,
    },
    badgeStatusPago: {
        backgroundColor: "#C8E6C9",
    },
    badgeTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 14,
        color: "#2E7D32",
        fontWeight: "bold",
        includeFontPadding: false,
    },
    tituloPix: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 24,
        fontWeight: "bold",
        color: "#000000",
        marginBottom: 12,
        includeFontPadding: false,
    },
    conteudoCentral: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        gap: 12,
        marginBottom: 14,
    },
    qrCodeWrapper: {
        padding: 8,
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 6,
        borderColor: "#FF9C72",
    },
    instrucaoTexto: {
        flex: 1,
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 14,
        color: "#000000",
        lineHeight: 20,
        includeFontPadding: false,
    },
    validadeTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 14,
        color: "#111111",
        marginBottom: 10,
        includeFontPadding: false,
    },
    boxChavePix: {
        backgroundColor: "#FF7124",
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        width: "100%",
        marginBottom: 14,
    },
    textoChavePix: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 11,
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 16,
        includeFontPadding: false,
    },
    btnCopiar: {
        backgroundColor: "#F2A879",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    btnCopiado: {
        backgroundColor: "#81C784",
    },
    btnCopiarTexto: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 13,
        color: "#222222",
        fontWeight: "600",
        includeFontPadding: false,
    },
});