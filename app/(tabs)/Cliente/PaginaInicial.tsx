import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../services/supabase";

import Header from "../Header";
import Sidebar from "../Sidebar";
import Card_Cliente from "../Card_Cliente/Card_Cliente";

// Interface dos dados do Supabase
export interface Restaurante {
    id: string;
    nome: string;
    imagem_url: string;
}

// Interface do item do carrinho
export interface ItemCarrinho {
    id: string;
    nome: string;
    preco: number;
    quantidade: number;
}

const { width } = Dimensions.get("window");
const NUM_COLUNAS = width > 700 ? 2 : 1; // 2 colunas em tablets/telas largas, 1 em smartphones

export default function PaginaInicial() {
    const navigation = useNavigation<any>();

    const [sidebarAberta, setSidebarAberta] = useState<boolean>(false);
    const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
    const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Carrega o carrinho persistido no armazenamento local
    useEffect(() => {
        async function carregarCarrinho() {
            try {
                const carrinhoSalvo = await AsyncStorage.getItem("carrinho");
                if (carrinhoSalvo) {
                    setCarrinho(JSON.parse(carrinhoSalvo));
                }
            } catch (error) {
                console.error("Erro ao carregar o carrinho:", error);
            }
        }

        carregarCarrinho();
    }, []);

    // Busca a lista de restaurantes no Supabase
    async function buscarRestaurantes() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("restaurantes")
                .select("id, nome, imagem_url");

            if (error) {
                throw error;
            }

            if (data) {
                setRestaurantes(data);
            }
        } catch (error) {
            console.error("Erro ao carregar restaurantes do Supabase:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        buscarRestaurantes();
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
                carrinhoCount={carrinho.length}
            />

            <Sidebar
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0066FF" />
                </View>
            ) : (
                <FlatList
                    data={restaurantes}
                    keyExtractor={(item) => item.id}
                    key={NUM_COLUNAS}
                    numColumns={NUM_COLUNAS}
                    refreshing={loading}
                    onRefresh={buscarRestaurantes}
                    contentContainerStyle={styles.gradCard}
                    columnWrapperStyle={NUM_COLUNAS > 1 ? styles.colunaWrapper : undefined}
                    renderItem={({ item }) => (
                        <View style={styles.cardItem}>
                            <Card_Cliente
                                rest={item.nome}
                                img={{ uri: item.imagem_url }}
                                onPress={() => navigation.navigate("Cardapio", { id: item.id, nome: item.nome })}
                            />
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.textoVazio}>Nenhum restaurante encontrado.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    // Equivalente ao container .grad_card
    gradCard: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        maxWidth: 1200,
        alignSelf: "center",
        width: "100%",
        gap: 24, // Espaçamento vertical entre linhas
    },
    colunaWrapper: {
        gap: 24, // Espaçamento horizontal entre colunas (telas largas)
    },
    cardItem: {
        flex: 1,
    },
    textoVazio: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
        color: "#6B7280",
    },
});   Isso aqui tá em react native e em typescript ?