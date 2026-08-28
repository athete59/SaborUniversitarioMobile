import React, { useState } from "react";
import {
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

export default function Login() {
  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
    Inter: Inter_400Regular,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);

  if (!fontsLoaded) {
    return null;
  }

  const Perfis = [
    {
      id: 1,
      idPerfil: "cliente",
      nome: "Agatha Junqueira",
      email: "agatha21@gmail.com",
      senha: "gatinha123",
    },
    {
      id: 2,
      idPerfil: "empresa",
      nome: "Restaurante Universitário",
      email: "ru@unifei.edu.br",
      senha: "betinho59",
    },
    {
      id: 3,
      idPerfil: "empresa",
      nome: "Cantina da Maria",
      email: "gabiroba2009@gmail.com",
      senha: "dadinho53",
    },
  ];

  function fazendoLogin() {
    const usuario = Perfis.find(
      (user) => user.email === email.trim() && user.senha === senha,
    );

    if (!usuario) {
      setErro("*Email ou senha inválidos.");
      return;
    }

    setErro(null);
    Alert.alert("Sucesso", `Bem-vindo(a), ${usuario.nome}!`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* .head { background-color: #FF7124; } */}
      <View style={styles.head}>
        {/* .h1 { color: white; font-family: "Berkshire Swash"; font-size: 2.2em; padding: 1.5em; } */}
        <Text style={styles.headerTitle}>Sabor Universitário</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* .form { background-color: #FF9C72; border-radius: 1em; padding: 2em; } */}
        <View style={styles.formCard}>
          {/* .login h2 */}
          <Text style={styles.h2Title}>Acesse a sua conta</Text>

          {/* .login div { display: flex; flex-direction: column; margin: 20px; padding: 0.75em; gap: 10px; } */}
          <View style={styles.loginDiv}>
            {/* .login h3 { font-weight: 400; font-family: "Inter"; } */}
            <Text style={styles.h3Subtitle}>
              Entre com o seu email e a sua senha
            </Text>

            {/* .alerta { color: #EA0505; } */}
            {erro && <Text style={styles.alerta}>{erro}</Text>}

            {/* .login input { padding: 0.7em; border-radius: 0.5em; width: 300px; } */}
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

            {/* .entrar { background-color: #FF7124; border-radius: 10px; border: 0.1em solid black; width: 300px; padding: 0.7em; } */}
            <TouchableOpacity
              style={styles.entrarButton}
              onPress={fazendoLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.entrarButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>

          {/* .login a { color: black; } */}
          <TouchableOpacity
            onPress={() => Alert.alert("Aviso", "Recuperar senha")}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* .login p { text-align: center; margin: 2em auto; } */}
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
    fontSize: 35, // Correspondente a ~2.2em da web
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
    borderRadius: 16, // Equivalente a 1em (16px)
    paddingVertical: 28, // Equivalente a 2em
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
  alerta: {
    fontFamily: "InterSemiBold",
    fontWeight: "600",
    color: "#EA0505",
    fontSize: 13,
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: 290, // .login input { width: 300px; } (ajustado levemente para encaixe perfeito no card)
    backgroundColor: "#ffffff",
    borderRadius: 8, // border-radius: 0.5em;
    paddingHorizontal: 14,
    paddingVertical: 11, // padding: 0.7em;
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    color: "#000000",
    marginBottom: 14, // margin: 1em;
    includeFontPadding: false,
  },
  entrarButton: {
    backgroundColor: "#FF7124", // background-color: #FF7124;
    borderRadius: 10, // border-radius: 10px;
    borderWidth: 1.5, // border: 0.1em solid black;
    borderColor: "#000000",
    width: 290, // width: 300px;
    paddingVertical: 11, // padding: 0.7em;
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
  forgotPassword: {
    fontFamily: "Inter",
    fontWeight: "400",
    color: "#000000",
    fontSize: 14,
    textDecorationLine: "underline",
    marginTop: 6,
    marginBottom: 18,
    includeFontPadding: false,
  },
  termsText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#000000",
    textAlign: "center",
    lineHeight: 16,
    width: 270,
    includeFontPadding: false,
  },
});
