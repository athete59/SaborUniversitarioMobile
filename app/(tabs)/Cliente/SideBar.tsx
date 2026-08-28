import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface SidebarProps {
    sidebarAberta: boolean;
    setSidebarAberta: (aberta: boolean) => void;
    nomeUsuario?: string;
    fichas?: number;
}

export default function Sidebar({
    sidebarAberta,
    setSidebarAberta,
    nomeUsuario = "Usuário",
    fichas = 0,
}: SidebarProps) {
    const navigation = useNavigation<any>();

    function navegarPara(rota: string) {
        setSidebarAberta(false);
        navigation.navigate(rota);
    }

    return (
        <Modal
            visible={sidebarAberta}
            transparent
            animationType="fade"
            onRequestClose={() => setSidebarAberta(false)}
        >
            <View style={styles.overlay}>
                {/* Backdrop escurecido para fechar a sidebar ao tocar fora */}
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setSidebarAberta(false)}
                />

                {/* Container da Sidebar */}
                <SafeAreaView style={styles.sidebar}>
                    {/* Header com avatar e dados do usuário */}
                    <View style={styles.sidebarHeader}>
                        <View style={styles.foto} />
                        <Text style={styles.nome}>{nomeUsuario}</Text>
                        <Text style={styles.fichas}>Fichas: $ {fichas}</Text>
                    </View>

                    {/* Lista de Navegação */}
                    <View style={styles.lista}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.item,
                                pressed && styles.itemPressionado,
                            ]}
                            onPress={() => navegarPara("PaginaInicial")}
                        >
                            <Text style={styles.itemTexto}>Início</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.item,
                                pressed && styles.itemPressionado,
                            ]}
                            onPress={() => navegarPara("MinhaConta")}
                        >
                            <Text style={styles.itemTexto}>Minha Conta</Text>
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.item,
                                pressed && styles.itemPressionado,
                            ]}
                            onPress={() => navegarPara("MeusPedidos")}
                        >
                            <Text style={styles.itemTexto}>Meus Pedidos</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: "row",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    sidebar: {
        width: 260,
        height: "100%",
        backgroundColor: "#554A45",
        padding: 20,
        elevation: 16,
        shadowColor: "#000000",
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    sidebarHeader: {
        alignItems: "center",
        marginBottom: 30,
        marginTop: 10,
    },
    foto: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#FFFFFF",
        marginBottom: 10,
    },
    nome: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    fichas: {
        color: "#FFFFFF",
        fontSize: 14,
        marginTop: 4,
        opacity: 0.9,
        textAlign: "center",
    },
    lista: {
        width: "100%",
    },
    item: {
        paddingVertical: 15,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.2)",
        borderRadius: 6,
    },
    itemPressionado: {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    itemTexto: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "500",
    },
});