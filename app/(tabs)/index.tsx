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

import { BerkshireSwash_400Regular } from "@expo-google-fonts/berkshire-swash";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { useAuth } from "../../services/authContext";
import { supabase } from "../../services/supabase";

export default function Login() {
  const router = useRouter();
  const auth = useAuth();

  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
    Inter: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  if (!fontsLoaded) {
    return null;
  }

  async function fazendoLogin() {
    if (!email || !senha) {
      setErro("*Preencha todos os campos.");
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const emailLimpo = email.trim();
      const senhaLimpa = senha.trim();

      // Consulta na tabela customizada 'usuarios'
      const { data: usuarios, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", emailLimpo)
        .eq("senha", senhaLimpa);

      if (error) {
        setErro("*Erro no Supabase: " + error.message);
        return;
      }

      if (!usuarios || usuarios.length === 0) {
        setErro("*Email ou senha incorretos.");
        return;
      }

      const usuarioLogado = usuarios[0];

      // 1. Notifica o AuthContext se houver método manual ou salva no AsyncStorage
      if (auth && (auth as any).signInManual) {
        await (auth as any).signInManual(usuarioLogado);
      } else {
        await AsyncStorage.setItem(
          "usuario_logado",
          JSON.stringify(usuarioLogado),
        );
      }

      // 2. Redirecionamento de rota
      router.replace("/Cliente/PaginaInicial");
    } catch (err: any) {
      Alert.alert(
        "Erro",
        err?.message || "Ocorreu um erro ao acessar a conta.",
      );
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
          <Text style={styles.h2Title}>Acesse a sua conta</Text>

          <View style={styles.loginDiv}>
            <Text style={styles.h3Subtitle}>
              Entre com o seu email e a sua senha
            </Text>

            {erro && <Text style={styles.alerta}>{erro}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#777777"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#777777"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity
              style={styles.entrarButton}
              onPress={fazendoLogin}
              disabled={carregando}
              activeOpacity={0.8}
            >
              {carregando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.entrarButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/esqueci-senha" as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Ao clicar em Entrar, você concorda com os termos de serviço e de
            uso.
          </Text>
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
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
    marginBottom: 12,
    includeFontPadding: false,
  },
  alerta: {
    fontFamily: "InterSemiBold",
    color: "#EA0505",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: 290,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: "Inter",
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
    fontSize: 16,
    includeFontPadding: false,
  },
  forgotPassword: {
    fontFamily: "Inter",
    color: "#000000",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 6,
    marginBottom: 18,
    includeFontPadding: false,
  },
  termsText: {
    fontFamily: "Inter",
    fontSize: 12,
    color: "#000000",
    textAlign: "center",
    lineHeight: 16,
    width: 270,
    includeFontPadding: false,
  },
});
