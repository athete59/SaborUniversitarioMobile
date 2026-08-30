import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../../services/supabase";
import HeaderEmpresa from "./HeaderEmpresa";
import SideBarEmpresa from "./SideBarEmpresa";

export default function CadastrarProduto() {
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // Campos do formulário
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [nome, setNome] = useState("");
  const [tipoBeneficio, setTipoBeneficio] = useState("");
  const [preco, setPreco] = useState("");
  const [estadoProduto, setEstadoProduto] = useState("");
  const [estoque, setEstoque] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagemUri, setImagemUri] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImagemUri(result.assets[0].uri);
    }
  };

  const salvarProduto = async () => {
    if (!nome || !preco) {
      Alert.alert("Atenção", "Preencha ao menos Nome e Preço.");
      return;
    }

    try {
      setCarregando(true);
      let nomeArquivoImagem = "";

      if (imagemUri) {
        const response = await fetch(imagemUri);
        const blob = await response.blob();
        nomeArquivoImagem = `${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("produtos")
          .upload(nomeArquivoImagem, blob, {
            contentType: "image/jpeg",
          });

        if (uploadError) throw uploadError;
      }

      const { error: dbError } = await supabase.from("produtos").insert([
        {
          nome,
          descricao,
          preco: `${preco} R$`,
          estado: 1,
          idempresa: 1,
          imagem: nomeArquivoImagem || null,
        },
      ]);

      if (dbError) throw dbError;

      Alert.alert("Sucesso", "Produto cadastrado com sucesso!");

      setCodigo("");
      setDescricao("");
      setNome("");
      setTipoBeneficio("");
      setPreco("");
      setEstadoProduto("");
      setEstoque("");
      setCategoria("");
      setImagemUri(null);
    } catch (error: any) {
      Alert.alert("Erro ao cadastrar", error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderEmpresa onPressMenu={() => setSidebarAberta(true)} />

      <SideBarEmpresa
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.tituloTela}>Cadastrar Produto</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.uploadBox} onPress={selecionarImagem}>
            {imagemUri ? (
              <Image source={{ uri: imagemUri }} style={styles.previewImagem} />
            ) : (
              <Text style={styles.uploadTexto}>UPLOAD IMAGEM DO PRODUTO</Text>
            )}
          </TouchableOpacity>

          <View style={styles.formCampos}>
            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Código:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={codigo}
                onChangeText={setCodigo}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Descrição:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Nome:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Tipo de benefício:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={tipoBeneficio}
                onChangeText={setTipoBeneficio}
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Preço:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={preco}
                onChangeText={setPreco}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Estado do produto:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={estadoProduto}
                onChangeText={setEstadoProduto}
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Estoque Inicial:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={estoque}
                onChangeText={setEstoque}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.campoGroup}>
              <Text style={styles.label}>
                Categoria do produto:<Text style={styles.asterisco}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={categoria}
                onChangeText={setCategoria}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btnSalvar}
          onPress={salvarProduto}
          disabled={carregando}
        >
          <Text style={styles.btnTexto}>
            {carregando ? "Salvando..." : "Salvar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { padding: 20 },
  tituloTela: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FA8006",
    textAlign: "center",
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: "column",
    gap: 15,
  },
  uploadBox: {
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  uploadTexto: {
    color: "#666666",
    fontWeight: "bold",
    textAlign: "center",
  },
  previewImagem: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  formCampos: {
    gap: 12,
  },
  campoGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    color: "#333333",
  },
  asterisco: {
    color: "#EA0505",
  },
  input: {
    backgroundColor: "#E0E0E0",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  btnSalvar: {
    backgroundColor: "#FFC288",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#FA8006",
  },
  btnTexto: {
    color: "#D96B00",
    fontWeight: "bold",
    fontSize: 16,
  },
});
