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

// Fontes
import {
  Belanosima_400Regular,
  Belanosima_600SemiBold,
  Belanosima_700Bold,
  useFonts as useBelanosima,
} from "@expo-google-fonts/belanosima";
import {
  Gabriela_400Regular,
  useFonts as useGabriela,
} from "@expo-google-fonts/gabriela";

import Header from "./Header";
import Sidebar from "./SideBar";

export default function AdicionarCartao() {
  const router = useRouter();

  const [gabrielaLoaded] = useGabriela({ Gabriela_400Regular });
  const [belanosimaLoaded] = useBelanosima({
    Belanosima_400Regular,
    Belanosima_600SemiBold,
    Belanosima_700Bold,
  });

  const [sidebarAberta, setSidebarAberta] = useState<boolean>(false);

  // Estados dos campos
  const [nomeTitular, setNomeTitular] = useState<string>("");
  const [numeroCartao, setNumeroCartao] = useState<string>("");
  const [dataValidade, setDataValidade] = useState<string>("");
  const [cvv, setCvv] = useState<string>("");

  /**
   * Formata o número do cartão para grupos de 4 dígitos (XXXX XXXX XXXX XXXX)
   */
  function handleNumeroCartaoChange(text: string) {
    const limpo = text.replace(/\D/g, ""); // Remove tudo que não é número
    const formatado = limpo.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    setNumeroCartao(formatado);
  }

  /**
   * Formata a data de validade com a barra (MM/AA)
   */
  function handleDataValidadeChange(text: string) {
    const limpo = text.replace(/\D/g, ""); // Remove tudo que não é número
    let formatado = limpo;

    if (limpo.length > 2) {
      formatado = `${limpo.slice(0, 2)}/${limpo.slice(2, 4)}`;
    }

    setDataValidade(formatado);
  }

  /**
   * Valida os campos do cartão e retorna para a tela de Resumo de Pedido.
   */
  function handleAdicionarCartao() {
    if (
      !nomeTitular.trim() ||
      !numeroCartao.trim() ||
      !dataValidade.trim() ||
      !cvv.trim()
    ) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha todos os campos.");
      return;
    }

    Alert.alert("Sucesso", "Cartão adicionado com sucesso!", [
      {
        text: "OK",
        onPress: () => {
          // Garante o retorno direto para o Resumo do Pedido
          router.replace("/(tabs)/Cliente/ResumoPedido" as any);
        },
      },
    ]);
  }

  if (!gabrielaLoaded || !belanosimaLoaded) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fa8006" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Sidebar
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <Header
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.btnVoltar}
          onPress={() => router.replace("/(tabs)/Cliente/ResumoPedido" as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.setaVoltar}>←</Text>
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

        {/* Nome do Titular */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nome do titular</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome impresso no cartão"
            placeholderTextColor="#999"
            value={nomeTitular}
            onChangeText={setNomeTitular}
            autoCapitalize="words"
          />
          <Text style={styles.campoObrigatorio}>*campo obrigatório</Text>
        </View>

        {/* Número do Cartão */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Número do cartão</Text>
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={numeroCartao}
            onChangeText={handleNumeroCartaoChange}
            maxLength={19}
          />
          <Text style={styles.campoObrigatorio}>*campo obrigatório</Text>
        </View>

        {/* Data de Validade e CVV */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.label}>Data de Validade</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/AA"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={dataValidade}
              onChangeText={handleDataValidadeChange}
              maxLength={5}
            />
            <Text style={styles.campoObrigatorio}>*campo obrigatório</Text>
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor="#999"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={(text) => setCvv(text.replace(/\D/g, ""))}
              maxLength={4}
            />
            <Text style={styles.campoObrigatorio}>*campo obrigatório</Text>
          </View>
        </View>

        {/* Botão Adicionar */}
        <TouchableOpacity
          style={styles.btnSalvar}
          onPress={handleAdicionarCartao}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSalvarTexto}>Adicionar novo cartão</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  btnVoltar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  setaVoltar: {
    fontSize: 22,
    color: "#F5670E",
    marginRight: 6,
    fontWeight: "bold",
  },
  textoVoltar: {
    fontFamily: "Belanosima_700Bold",
    fontSize: 22,
    color: "#F5670E",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Belanosima_600SemiBold",
    fontSize: 18,
    color: "#222222",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#EBEBEB",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontFamily: "Belanosima_400Regular",
    fontSize: 16,
    color: "#333333",
  },
  campoObrigatorio: {
    fontFamily: "Belanosima_400Regular",
    fontSize: 12,
    color: "#E53935",
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnSalvar: {
    backgroundColor: "#FF9C72",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "rgba(0,0,0,0.15)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSalvarTexto: {
    fontFamily: "Belanosima_700Bold",
    color: "#FFFFFF",
    fontSize: 17,
  },
});