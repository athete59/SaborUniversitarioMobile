import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export interface ItemCarrinho {
    id: string;
    nome: string;
    preco: number;
    quantidade: number;
}

interface HeaderProps {
    sidebarAberta: boolean;
    setSidebarAberta: React.Dispatch<React.SetStateAction<boolean>>;
    carrinho?: ItemCarrinho[];
    nomeUsuario?: string;
    fichas?: number;
    carrinhoCount?: number;
}

export default function Header({
    sidebarAberta,
    setSidebarAberta,
    carrinho = [],
    nomeUsuario = "Usuário",
    fichas = 0,
}: HeaderProps) {
    const navigation = useNavigation<any>();

    const totalItens = carrinho.reduce(
        (total, item) => total + item.quantidade,
        0
    );

    return (
        <View style={styles.header}>
            {/* Seção Perfil */}
            <Pressable
                style={({ pressed }) => [
                    styles.perfil,
                    pressed && styles.botaoPressionado,
                ]}
                onPress={() => setSidebarAberta(!sidebarAberta)}
                hitSlop={8}
            >
                <View style={styles.foto} />
                <View>
                    <Text style={styles.nome}>{nomeUsuario}</Text>
                    <Text style={styles.fichas}>Fichas: $ {fichas}</Text>
                </View>
            </Pressable>

            {/* Título Centralizado */}
            <View style={styles.tituloWrapper} pointerEvents="none">
                <Text style={styles.titulo} numberOfLines={1}>
                    Sabor Universitário
                </Text>
            </View>

            {/* Botão Carrinho */}
            <Pressable
                style={({ pressed }) => [
                    styles.carrinhoBtn,
                    pressed && styles.carrinhoBtnPressionado,
                ]}
                onPress={() => navigation.navigate("Carrinho")}
                hitSlop={8}
            >
                <Text style={styles.carrinhoTexto}>🛒 {totalItens}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#ff7124",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        position: "relative",
        elevation: 4, // Sombra Android
        shadowColor: "#000000", // Sombra iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    perfil: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        zIndex: 2,
    },
    foto: {
        width: 44,
        height: 44,
        backgroundColor: "#FFFFFF",
        borderRadius: 22,
    },
    nome: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 15,
    },
    fichas: {
        color: "#FFFFFF",
        fontSize: 13,
        opacity: 0.9,
    },
    tituloWrapper: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
    },
    titulo: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    carrinhoBtn: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        zIndex: 2,
    },
    carrinhoBtnPressionado: {
        transform: [{ scale: 0.96 }],
        opacity: 0.9,
    },
    carrinhoTexto: {
        color: "#ff6b2c",
        fontSize: 16,
        fontWeight: "bold",
    },
    botaoPressionado: {
        opacity: 0.75,
    },
});