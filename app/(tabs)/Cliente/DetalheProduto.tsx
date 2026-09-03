import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    Image,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Fontes
import {
    useFonts as useBelanosima,
    Belanosima_400Regular,
    Belanosima_600SemiBold,
} from "@expo-google-fonts/belanosima";
import {
    useFonts as useArbutusSlab,
    ArbutusSlab_400Regular,
} from "@expo-google-fonts/arbutus-slab";
import {
    useFonts as useGabriela,
    Gabriela_400Regular,
} from "@expo-google-fonts/gabriela";

import Header from "./Header";
import Sidebar from "./SideBar";
import { supabase } from "../../../services/supabase";
import { useCartStore } from "../../stores/useCartStore";

export interface Produto {
    id: string | number;
    nome: string;
    preco: number;
    imagem: string;
    descricao?: string;
    categoria?: string;
}

const IMAGEM_PADRAO = "https://via.placeholder.com/300";

export default function DetalheProduto() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [produto, setProduto] = useState<Produto | null>(null);
    const [carregando, setCarregando] = useState<boolean>(true);
    const [sidebarAberta, setSidebarAberta] = useState<boolean>(false);
    const [observacao, setObservacao] = useState<string>("");
    const [inputFocado, setInputFocado] = useState(false);

    // Zustand: Ação global única
    const adicionarItem = useCartStore((state) => state.adicionarItem);

    const [belanosimaLoaded] = useBelanosima({
        Belanosima_400Regular,
        Belanosima_600SemiBold,
    });
    const [arbutusLoaded] = useArbutusSlab({ ArbutusSlab_400Regular });
    const [gabrielaLoaded] = useGabriela({ Gabriela_400Regular });

    function obterUrlImagem(caminho?: string): string {
        if (!caminho || typeof caminho !== "string") return IMAGEM_PADRAO;
        if (caminho.startsWith("http://") || caminho.startsWith("https://")) return caminho;

        const nomeArquivo = caminho.replace(/^\//, "").replace(/^images\//, "");
        const { data } = supabase.storage.from("produtos").getPublicUrl(nomeArquivo);
        return data?.publicUrl || IMAGEM_PADRAO;
    }

    const buscarProduto = useCallback(async () => {
        if (!id) {
            setCarregando(false);
            return;
        }
        try {
            setCarregando(true);
            const { data, error } = await supabase
                .from("produtos")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;

            if (data) {
                let precoConvertido = 0;
                if (typeof data.preco === "number") {
                    precoConvertido = data.preco;
                } else if (typeof data.preco === "string") {
                    const apenasNumeros = data.preco
                        .replace(/[^0-9.,]/g, "")
                        .replace(",", ".");
                    precoConvertido = parseFloat(apenasNumeros) || 0;
                }

                setProduto({
                    ...data,
                    preco: precoConvertido,
                    imagem: obterUrlImagem(data.imagem),
                });
            }
        } catch (err: any) {
            Alert.alert("Erro", "Não foi possível carregar os detalhes do produto.");
        } finally {
            setCarregando(false);
        }
    }, [id]);

    useEffect(() => {
        buscarProduto();
    }, [buscarProduto]);

    function handleAdicionarCarrinho(redirecionarParaCheckout = false) {
        if (!produto) return;

        // Adiciona direto na store global do Zustand
        adicionarItem({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: 1,
        });

        if (redirecionarParaCheckout) {
            router.push("/(tabs)/Cliente/ResumoPedido" as any);
        } else {
            Alert.alert("Sucesso", `${produto.nome} foi adicionado ao carrinho!`);
        }
    }

    if (!belanosimaLoaded || !arbutusLoaded || !gabrielaLoaded || carregando) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#F5670E" />
            </View>
        );
    }

    if (!produto) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.textoVazio}>Produto não encontrado.</Text>
                <Pressable style={styles.btnSimples} onPress={() => router.back()}>
                    <Text style={styles.btnTextoSimples}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.screenWrapper}>
            <Header
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />
            {sidebarAberta && (
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setSidebarAberta(false)}
                />
            )}
            <Sidebar
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.container,
                        { paddingBottom: insets.bottom + 24 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.tituloSecao}>Restaurante universitário</Text>

                    <View style={styles.detalheBox}>
                        <View style={styles.detalheImagemContainer}>
                            <Image
                                source={{ uri: produto.imagem }}
                                style={styles.detalheImagem}
                            />
                        </View>

                        <View style={styles.detalheInfo}>
                            <View style={styles.topoDetalhe}>
                                <Text style={styles.nomeProduto}>{produto.nome}</Text>
                            </View>

                            <Text style={styles.precoDetalhe}>
                                {produto.preco.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                            </Text>

                            <View style={styles.botoesDetalhe}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.btnAdicionar,
                                        pressed && styles.btnPressionado,
                                    ]}
                                    onPress={() => handleAdicionarCarrinho(false)}
                                >
                                    <Text style={styles.btnTextoAdicionar}>Adicionar</Text>
                                </Pressable>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.btnComprar,
                                        pressed && styles.btnPressionado,
                                    ]}
                                    onPress={() => handleAdicionarCarrinho(true)}
                                >
                                    <Text style={styles.btnTextoComprar}>Comprar</Text>
                                </Pressable>
                            </View>

                            <Text style={styles.tituloDetalhe}>Detalhes do produto</Text>
                            <Text style={styles.descricaoProduto}>
                                {produto.descricao ||
                                    "Produto preparado com ingredientes frescos da universidade."}
                            </Text>

                            <Text style={styles.tituloDetalhe}>Alguma observação?</Text>
                            <TextInput
                                style={[
                                    styles.inputObservacao,
                                    inputFocado && styles.inputFocado,
                                ]}
                                placeholder="Digite aqui..."
                                placeholderTextColor="#999"
                                value={observacao}
                                onChangeText={setObservacao}
                                onFocus={() => setInputFocado(true)}
                                onBlur={() => setInputFocado(false)}
                                maxLength={120}
                            />

                            <Pressable
                                style={({ pressed }) => [
                                    styles.btnVoltar,
                                    pressed && styles.btnPressionado,
                                ]}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.btnTextoVoltar}>
                                    Voltar para o Cardápio
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenWrapper: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        padding: 16,
        flexGrow: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 10,
    },
    tituloSecao: {
        textAlign: "center",
        color: "#fa8006",
        fontFamily: "Gabriela_400Regular",
        fontSize: 28,
        marginVertical: 20,
    },
    detalheBox: {
        backgroundColor: "#F8E2CC",
        borderRadius: 10,
        padding: 20,
        gap: 24,
    },
    detalheImagemContainer: {
        width: "100%",
        height: 250,
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    detalheImagem: {
        width: "82%",
        height: "82%",
        resizeMode: "contain",
    },
    detalheInfo: {
        flex: 1,
    },
    topoDetalhe: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    nomeProduto: {
        fontFamily: "Belanosima_600SemiBold",
        fontSize: 28,
        color: "#000000",
    },
    precoDetalhe: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 30,
        color: "#FF8000",
        marginVertical: 12,
    },
    botoesDetalhe: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    btnAdicionar: {
        flex: 1,
        height: 52,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
    },
    btnTextoAdicionar: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 16,
        color: "#000000",
    },
    btnComprar: {
        flex: 1,
        height: 52,
        backgroundColor: "#F5670E",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 5,
    },
    btnTextoComprar: {
        fontFamily: "ArbutusSlab_400Regular",
        fontSize: 16,
        color: "#FFFFFF",
    },
    tituloDetalhe: {
        fontFamily: "Gabriela_400Regular",
        fontSize: 20,
        color: "#111111",
        marginBottom: 8,
    },
    descricaoProduto: {
        fontFamily: "Belanosima_400Regular",
        fontSize: 15,
        color: "#333333",
        lineHeight: 20,
        marginBottom: 20,
    },
    inputObservacao: {
        width: "100%",
        height: 54,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#999999",
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        marginBottom: 20,
    },
    inputFocado: {
        borderColor: "#F47A00",
    },
    btnVoltar: {
        paddingVertical: 12,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    btnTextoVoltar: {
        fontFamily: "Belanosima_600SemiBold",
        color: "#F5670E",
        fontSize: 16,
        textDecorationLine: "underline",
    },
    btnPressionado: {
        opacity: 0.75,
        transform: [{ translateY: 2 }],
    },
    textoVazio: {
        fontSize: 18,
        color: "#555",
        marginBottom: 16,
        fontFamily: "Belanosima_400Regular",
    },
    btnSimples: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#F5670E",
    },
    btnTextoSimples: {
        color: "#F5670E",
        fontFamily: "Belanosima_600SemiBold",
        fontSize: 16,
    },
});