import React, { useState } from "react";
import {
  Alert,
  Image,
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
import Header from "./Header";
import Sidebar from "./SideBar";

/**
 * Tela do perfil do cliente com informações cadastrais, atalhos de navegação e logout.
 */
export default function MeuPerfil() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [sidebarAberta, setSidebarAberta] = useState(false);

  /**
   * Solicita confirmação do usuário e realiza o logout da conta.
   */
  const handleSair = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja encerrar a sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/");
          } catch (error) {
            console.log("Erro ao sair:", error);
          }
        },
      },
    ]);
  };

  const nomeUsuario = user?.nome || "Cliente";
  const emailUsuario = user?.email || "Não informado";
  const tipoUsuario = user?.tipo ? user.tipo.toUpperCase() : "CLIENTE";
  const fotoUrl = user?.perfil?.foto_url;

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <Header
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        nomeUsuario={nomeUsuario}
      />

      <Sidebar
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão de Identificação do Perfil */}
        <View style={styles.cardPerfil}>
          <View style={styles.avatarContainer}>
            {fotoUrl ? (
              <Image source={{ uri: fotoUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={48} color="#FA8006" />
              </View>
            )}
          </View>

          <Text style={styles.nomePerfil}>{nomeUsuario}</Text>
          <Text style={styles.emailPerfil}>{emailUsuario}</Text>

          <View style={styles.badgeTipo}>
            <Text style={styles.badgeTipoTexto}>{tipoUsuario}</Text>
          </View>
        </View>

        {/* Informações da Conta */}
        <Text style={styles.secaoTitulo}>Dados da Conta</Text>
        <View style={styles.cardInfo}>
          <View style={styles.linhaInfo}>
            <View style={styles.infoIcone}>
              <Feather name="user" size={18} color="#FA8006" />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoLabel}>Nome Completo</Text>
              <Text style={styles.infoValor}>{nomeUsuario}</Text>
            </View>
          </View>

          <View style={styles.divisor} />

          <View style={styles.linhaInfo}>
            <View style={styles.infoIcone}>
              <Feather name="mail" size={18} color="#FA8006" />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoLabel}>E-mail de Acesso</Text>
              <Text style={styles.infoValor}>{emailUsuario}</Text>
            </View>
          </View>

          <View style={styles.divisor} />

          <View style={styles.linhaInfo}>
            <View style={styles.infoIcone}>
              <Feather name="shield" size={18} color="#FA8006" />
            </View>
            <View style={styles.infoTextos}>
              <Text style={styles.infoLabel}>Tipo de Permissão</Text>
              <Text style={styles.infoValor}>{tipoUsuario}</Text>
            </View>
          </View>
        </View>

        {/* Atalhos Rápidos */}
        <Text style={styles.secaoTitulo}>Atalhos</Text>
        <View style={styles.containerOpcoes}>
          <TouchableOpacity
            style={styles.opcaoItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/Cliente/MeusPedidos" as any)}
          >
            <View
              style={[styles.opcaoIcone, { backgroundColor: "#FFF2E6" }]}
            >
              <MaterialIcons name="receipt-long" size={22} color="#FA8006" />
            </View>
            <View style={styles.opcaoTextoContainer}>
              <Text style={styles.opcaoTitulo}>Meus Pedidos & QR Codes</Text>
              <Text style={styles.opcaoSubtitulo}>
                Acompanhe status e exiba seus códigos de retirada
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.opcaoItem}
            activeOpacity={0.7}
            onPress={() => router.push("/(tabs)/Cliente/PaginaInicial" as any)}
          >
            <View
              style={[styles.opcaoIcone, { backgroundColor: "#EAF9ED" }]}
            >
              <MaterialIcons name="restaurant" size={22} color="#27AE60" />
            </View>
            <View style={styles.opcaoTextoContainer}>
              <Text style={styles.opcaoTitulo}>Cardápio Universitário</Text>
              <Text style={styles.opcaoSubtitulo}>
                Explore os pratos e lanches disponíveis hoje
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Botão Sair */}
        <TouchableOpacity
          style={styles.btnSair}
          activeOpacity={0.8}
          onPress={handleSair}
        >
          <Feather name="log-out" size={20} color="#D9534F" />
          <Text style={styles.btnSairTexto}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </ScrollView>
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
  cardPerfil: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    marginBottom: 14,
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFF2E6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FA8006",
  },
  nomePerfil: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
  },
  emailPerfil: {
    fontSize: 14,
    color: "#777777",
    marginTop: 2,
  },
  badgeTipo: {
    backgroundColor: "#FFF2E6",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeTipoTexto: {
    color: "#FA8006",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222222",
    marginBottom: 12,
  },
  cardInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  linhaInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoIcone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF2E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextos: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888888",
  },
  infoValor: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
    marginTop: 1,
  },
  divisor: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 4,
  },
  containerOpcoes: {
    gap: 12,
    marginBottom: 24,
  },
  opcaoItem: {
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
  opcaoIcone: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  opcaoTextoContainer: {
    flex: 1,
  },
  opcaoTitulo: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222222",
  },
  opcaoSubtitulo: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  btnSair: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFECEC",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#F5C6CB",
  },
  btnSairTexto: {
    color: "#D9534F",
    fontWeight: "bold",
    fontSize: 15,
  },
});
