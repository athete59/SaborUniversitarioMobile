import { BerkshireSwash_400Regular } from "@expo-google-fonts/berkshire-swash";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buscarUsuarioPorEmail } from "../services/usuarioService";

export default function EsqueceuSenha() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
    Inter: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const [segundos, setSegundos] = useState<number>(60);
  const [codigoInput, setCodigoInput] = useState<string>("");
  const [carregando, setCarregando] = useState<boolean>(false);

  // Lógica do Temporizador
  useEffect(() => {
    let timer: any;
    if (segundos > 0) {
      timer = setTimeout(() => {
        setSegundos((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [segundos]);

  function reiniciarCodigo() {
    setSegundos(60);
    Alert.alert("Sucesso", "Novo código solicitado!");
  }

  async function verificarSenha() {
    setCarregando(true);

    try {
      const email = await AsyncStorage.getItem("emailRecuperacao");

      if (!email) {
        Alert.alert(
          "Aviso",
          "Digite o e-mail na tela de login antes de recuperar a senha.",
        );
        setCarregando(false);
        return;
      }

      const usuario = await buscarUsuarioPorEmail(email);

      if (!usuario) {
        Alert.alert("Erro", "E-mail não encontrado.");
        setCarregando(false);
        return;
      }

      // Redireciona para a tela de redefinição de senha
      router.push("/redefinir-senha" as any);
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao verificar os dados.");
    } finally {
      setCarregando(false);
    }
  }

  if (!fontsLoaded) {
    return null;
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
        <View style={[styles.formCard, styles.espacamento]}>
          <Text style={styles.h2Title}>Redefinir Senha</Text>

          <View style={styles.loginDiv}>
            <Text style={[styles.h3Subtitle, styles.aumentar]}>
              Preencha com o código de segurança recebido pelo e-mail
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Código de segurança"
              placeholderTextColor="#777777"
              keyboardType="number-pad"
              value={codigoInput}
              onChangeText={setCodigoInput}
            />

            {segundos > 0 ? (
              <Text style={styles.timerText}>
                Código válido por {segundos} segundos
              </Text>
            ) : (
              <TouchableOpacity
                onPress={reiniciarCodigo}
                activeOpacity={0.7}
                style={styles.espaco}
              >
                <Text style={styles.linkNovoCodigo}>Novo código de acesso</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.entrarButton}
              onPress={verificarSenha}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.entrarButtonText}>Verificar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.voltarLogin}>Voltar para o Login</Text>
          </TouchableOpacity>
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
  espacamento: {
    paddingVertical: 32,
  },
  h2Title: {
    fontFamily: "InterBold",
    fontWeight: "700",
    fontSize: 22,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
    includeFontPadding: false,
  },
  loginDiv: {
    width: "100%",
    alignItems: "center",
    marginVertical: 10,
  },
  aumentar: {
    maxWidth: 300,
    lineHeight: 22,
  },
  h3Subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
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
    marginBottom: 12,
    includeFontPadding: false,
  },
  timerText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#000000",
    marginBottom: 16,
    textAlign: "center",
  },
  espaco: {
    marginBottom: 16,
  },
  linkNovoCodigo: {
    fontFamily: "InterSemiBold",
    fontWeight: "600",
    fontSize: 14,
    color: "#000000",
    textDecorationLine: "underline",
    textAlign: "center",
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
    marginTop: 4,
  },
  entrarButtonText: {
    color: "#ffffff",
    fontFamily: "InterBold",
    fontWeight: "700",
    fontSize: 16,
    includeFontPadding: false,
  },
  voltarLogin: {
    fontFamily: "Inter",
    fontWeight: "400",
    color: "#000000",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 14,
    includeFontPadding: false,
  },
});
