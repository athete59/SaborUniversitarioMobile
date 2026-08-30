import { BerkshireSwash_400Regular } from "@expo-google-fonts/berkshire-swash";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { atualizarSenha } from "../services/usuarioService";

export default function RedefinirSenha() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
    Inter: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const [senha, setSenha] = useState<string>("");
  const [confirmarSenha, setConfirmarSenha] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);

  if (!fontsLoaded) {
    return null;
  }

  async function Enviar() {
    if (senha !== confirmarSenha) {
      Alert.alert("Aviso", "As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      // Equivalente ao localStorage.getItem("emailRecuperacao") da Web
      const email = await AsyncStorage.getItem("emailRecuperacao");

      if (!email) {
        Alert.alert("Aviso", "Nenhum e-mail encontrado para recuperação.");
        setCarregando(false);
        return;
      }

      const sucesso = await atualizarSenha(email, senha);

      if (!sucesso) {
        Alert.alert("Erro", "Erro ao atualizar a senha.");
        setCarregando(false);
        return;
      }

      // Equivalente ao localStorage.removeItem("emailRecuperacao")
      await AsyncStorage.removeItem("emailRecuperacao");

      // Redireciona para a tela de sucesso
      router.push("/SenhaSucesso" as any);
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao processar a solicitação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.head}>
        <Text style={styles.headerTitle}>Sabor Universitário</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.h2Title}>Redefinir Senha</Text>

          <View style={styles.loginDiv}>
            <Text style={styles.h3Subtitle}>Preencha a sua nova senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#777777"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirme sua Senha"
              placeholderTextColor="#777777"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <TouchableOpacity
              style={styles.entrarButton}
              onPress={Enviar}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.entrarButtonText}>Enviar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  head: {
    backgroundColor: "#FF7124",
    width: "100%",
    paddingTop: 40,
    paddingBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#ffffff",
    fontFamily: "BerkshireSwash",
    fontSize: 35,
    textAlign: "center",
    includeFontPadding: false,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  formCard: {
    backgroundColor: "#FF9C72",
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    width: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  h2Title: {
    fontFamily: "InterBold",
    fontWeight: "700",
    fontSize: 22,
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
    includeFontPadding: false,
  },
  loginDiv: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
    paddingVertical: 10,
  },
  h3Subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
    includeFontPadding: false,
  },
  input: {
    width: 290,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    color: "#000000",
    marginBottom: 14,
    includeFontPadding: false,
  },
  entrarButton: {
    backgroundColor: "#FF7124",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#000000",
    width: 290,
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  entrarButtonText: {
    color: "#ffffff",
    fontFamily: "InterBold",
    fontWeight: "700",
    fontSize: 16,
    includeFontPadding: false,
  },
});
