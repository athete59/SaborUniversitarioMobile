import {
  ArbutusSlab_400Regular,
  useFonts as useArbutus,
} from "@expo-google-fonts/arbutus-slab";
import {
  Belanosima_400Regular,
  Belanosima_600SemiBold,
  useFonts as useBelanosima,
} from "@expo-google-fonts/belanosima";
import {
  Gabriela_400Regular,
  useFonts as useGabriela,
} from "@expo-google-fonts/gabriela";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../../../services/supabase";
import Header from "./Header";
import Sidebar from "./SideBar";

interface Produto {
  id_produto?: number;
  id?: string | number;
  nome: string;
  preco: number | string;
  imagem?: string;
  idcategoria?: number;
  idempresa?: number;
}

const IMAGEM_PADRAO = "https://via.placeholder.com/150";

export default function Cardapio() {
  const params = useLocalSearchParams();
  const idRestaurante = params.id;
  const nomeRestaurante = params.nome
    ? String(params.nome)
    : "Restaurante Universitário";

  const [sidebarAberta, setSidebarAberta] = useState<boolean>(false);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [produtos, setProdutos] = useState<{
    bebidas: Produto[];
    salgados: Produto[];
  }>({
    bebidas: [],
    salgados: [],
  });
  const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({});
  const [carrinho, setCarrinho] = useState<any[]>([]);

  const [arbutusLoaded] = useArbutus({ ArbutusSlab_400Regular });
  const [belanosimaLoaded] = useBelanosima({
    Belanosima_400Regular,
    Belanosima_600SemiBold,
  });
  const [gabrielaLoaded] = useGabriela({ Gabriela_400Regular });

  useEffect(() => {
    async function carregarProdutosDoBanco() {
      try {
        setCarregando(true);
        let query = supabase.from("produtos").select("*");

        const idNumerico = Number(idRestaurante);
        if (!isNaN(idNumerico) && idNumerico > 0) {
          query = query.eq("idempresa", idNumerico);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data && Array.isArray(data)) {
          const bebidas = data.filter((p: any) => p.idcategoria === 1);
          const salgados = data.filter((p: any) => p.idcategoria === 2);
          setProdutos({ bebidas, salgados });
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        Alert.alert("Erro", "Não foi possível carregar os produtos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutosDoBanco();
  }, [idRestaurante]);

  function formatarPreco(valor: any): string {
    if (!valor) return "0.00 R$";
    if (typeof valor === "number") return `${valor.toFixed(2)} R$`;

    const apenasNumeros = String(valor)
      .replace(/[^0-9.,]/g, "")
      .replace(",", ".");
    const num = parseFloat(apenasNumeros);

    if (isNaN(num)) return "0.00 R$";
    return `${num.toFixed(2)} R$`;
  }

  function obterFonteImagem(caminho?: string): { uri: string } {
    if (!caminho || typeof caminho !== "string") {
      return { uri: IMAGEM_PADRAO };
    }

    // Se já for uma URL pública completa do Supabase ou web (http/https)
    if (caminho.startsWith("http://") || caminho.startsWith("https://")) {
      return { uri: caminho };
    }

    // Caso você tenha salvo apenas o nome do arquivo (ex: "suco.png") no banco:
    const nomeArquivo = caminho.replace(/^\//, "").replace(/^images\//, "");
    const { data } = supabase.storage
      .from("produtos")
      .getPublicUrl(nomeArquivo);

    if (data?.publicUrl) {
      return { uri: data.publicUrl };
    }

    return { uri: IMAGEM_PADRAO };
  }

  function alterarQuantidade(nomeProduto: string, delta: number) {
    setQuantidades((prev) => {
      const atual = prev[nomeProduto] || 1;
      const novaQtd = atual + delta;
      return { ...prev, [nomeProduto]: novaQtd > 0 ? novaQtd : 1 };
    });
  }

  async function adicionarCarrinho(produto: Produto) {
    const qtd = quantidades[produto.nome] || 1;
    const item = { ...produto, quantidade: qtd };
    const novoCarrinho = [...carrinho, item];
    setCarrinho(novoCarrinho);
    await AsyncStorage.setItem("carrinho", JSON.stringify(novoCarrinho));
    Alert.alert("Sucesso", `${produto.nome} adicionado ao carrinho!`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
        carrinho={carrinho}
      />
      <Sidebar
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.tituloWeb}>{nomeRestaurante}</Text>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color="#F5670E"
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* Bebidas */}
            <View style={styles.categoriaWeb}>
              <Text style={styles.categoriaTextoWeb}>• Bebidas</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.produtosGridWeb}
            >
              {produtos.bebidas.length > 0 ? (
                produtos.bebidas.map((item, idx) => (
                  <View
                    key={item.id_produto || item.id || idx}
                    style={styles.cardProdutoWeb}
                  >
                    <View style={styles.imgProdutoWeb}>
                      <Image
                        source={obterFonteImagem(item.imagem)}
                        style={styles.imgInside}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.cardNomeWeb} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={styles.cardPrecoWeb}>
                      {formatarPreco(item.preco)}
                    </Text>

                    <View style={styles.controleWeb}>
                      <TouchableOpacity
                        style={styles.btnControle}
                        onPress={() => alterarQuantidade(item.nome, -1)}
                      >
                        <Text style={styles.btnControleTexto}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtdTexto}>
                        {quantidades[item.nome] || 1}
                      </Text>
                      <TouchableOpacity
                        style={styles.btnControle}
                        onPress={() => alterarQuantidade(item.nome, 1)}
                      >
                        <Text style={styles.btnControleTexto}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.btnCardWeb}
                      onPress={() => adicionarCarrinho(item)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnCardTextoWeb}>Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.vazioText}>Nenhuma bebida disponível.</Text>
              )}
            </ScrollView>

            {/* Salgados */}
            <View style={styles.categoriaWeb}>
              <Text style={styles.categoriaTextoWeb}>• Salgados</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.produtosGridWeb}
            >
              {produtos.salgados.length > 0 ? (
                produtos.salgados.map((item, idx) => (
                  <View
                    key={item.id_produto || item.id || idx}
                    style={styles.cardProdutoWeb}
                  >
                    <View style={styles.imgProdutoWeb}>
                      <Image
                        source={obterFonteImagem(item.imagem)}
                        style={styles.imgInside}
                        resizeMode="cover"
                      />
                    </View>
                    <Text style={styles.cardNomeWeb} numberOfLines={1}>
                      {item.nome}
                    </Text>
                    <Text style={styles.cardPrecoWeb}>
                      {formatarPreco(item.preco)}
                    </Text>

                    <View style={styles.controleWeb}>
                      <TouchableOpacity
                        style={styles.btnControle}
                        onPress={() => alterarQuantidade(item.nome, -1)}
                      >
                        <Text style={styles.btnControleTexto}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtdTexto}>
                        {quantidades[item.nome] || 1}
                      </Text>
                      <TouchableOpacity
                        style={styles.btnControle}
                        onPress={() => alterarQuantidade(item.nome, 1)}
                      >
                        <Text style={styles.btnControleTexto}>+</Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.btnCardWeb}
                      onPress={() => adicionarCarrinho(item)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnCardTextoWeb}>Adicionar</Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={styles.vazioText}>Nenhum salgado disponível.</Text>
              )}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tituloWeb: {
    textAlign: "center",
    color: "#fa8006",
    fontFamily: "Gabriela_400Regular",
    fontSize: 28,
    marginVertical: 20,
  },
  categoriaWeb: {
    backgroundColor: "#FFE7D2",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriaTextoWeb: {
    fontSize: 24,
    color: "#F5670E",
    fontFamily: "ArbutusSlab_400Regular",
  },
  produtosGridWeb: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24,
  },
  cardProdutoWeb: {
    width: 175,
    height: 250,
    backgroundColor: "#FF9C72",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  imgProdutoWeb: {
    width: "100%",
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imgInside: {
    width: "100%",
    height: "100%",
  },
  cardNomeWeb: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    marginVertical: 2,
  },
  cardPrecoWeb: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  controleWeb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  btnControle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  btnControleTexto: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  qtdTexto: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  btnCardWeb: {
    width: 128.46,
    height: 30.17,
    borderRadius: 8.03,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  btnCardTextoWeb: {
    color: "#111111",
    fontFamily: "Belanosima_600SemiBold",
    fontSize: 15.57,
  },
  vazioText: {
    color: "#777777",
    fontSize: 14,
    fontStyle: "italic",
    marginLeft: 8,
  },
});
