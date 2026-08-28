import {
    Gabriela_400Regular,
    useFonts as useGabriela,
} from "@expo-google-fonts/gabriela";
import { useRouter } from "expo-router";
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

interface Empresa {
  id?: number;
  id_empresa?: number;
  idempresa?: number;
  nome?: string;
  nome_empresa?: string;
  Nome?: string;
  imagem?: string;
  imagem_url?: string;
  url_imagem?: string;
}

export default function PaginaInicial() {
  const router = useRouter();
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Carrega a fonte exata da web ("Gabriela")
  const [gabrielaLoaded] = useGabriela({
    Gabriela_400Regular,
  });

  useEffect(() => {
    async function carregarEmpresas() {
      try {
        setCarregando(true);
        const { data, error } = await supabase.from("empresas").select("*");

        if (error) throw error;
        if (data) {
          setEmpresas(data);
        }
      } catch (err) {
        console.error("Erro ao carregar restaurantes:", err);
        Alert.alert("Erro", "Não foi possível carregar os restaurantes.");
      } finally {
        setCarregando(false);
      }
    }

    carregarEmpresas();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />
      <Sidebar
        sidebarAberta={sidebarAberta}
        setSidebarAberta={setSidebarAberta}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {carregando ? (
          <ActivityIndicator
            size="large"
            color="#FF7124"
            style={{ marginTop: 40 }}
          />
        ) : (
          empresas.map((item, index) => {
            // Mapeamento dinâmico para pegar a propriedade correta do banco
            const idEmpresa =
              item.id_empresa ?? item.idempresa ?? item.id ?? index;
            const nomeRestaurante =
              item.nome || item.nome_empresa || item.Nome || "Restaurante";
            const imagemUrl = item.imagem || item.imagem_url || item.url_imagem;

            return (
              <TouchableOpacity
                key={idEmpresa}
                style={styles.cardRestaurante}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/Cliente/Cardapio",
                    params: { id: idEmpresa, nome: nomeRestaurante },
                  } as any)
                }
              >
                {/* .img-card: 80x80 (adaptado do 100x100 para proporção mobile), circular */}
                <View style={styles.imgCardContainer}>
                  {imagemUrl ? (
                    <Image
                      source={{ uri: imagemUrl }}
                      style={styles.imgCard}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.imgCard, styles.placeholderImg]} />
                  )}
                </View>

                {/* .nome-restaurante: font-family: "Gabriela", color: white */}
                <Text
                  style={[
                    styles.nomeRestaurante,
                    gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
                  ]}
                  numberOfLines={2}
                >
                  {nomeRestaurante}
                </Text>
              </TouchableOpacity>
            );
          })
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
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  /* .card-restaurante do CSS da Web */
  cardRestaurante: {
    backgroundColor: "#FF9C72", // background-color: #FF9C72
    borderRadius: 22.4, // border-radius: 1.4em
    padding: 12.8, // padding: 0.8em
    flexDirection: "row", // layout em linha
    alignItems: "center",
    justifyContent: "flex-start", // alinhado à esquerda como na web
    width: "100%",

    // box-shadow: 0px 0px 4px rgb(98, 22, 1)
    shadowColor: "rgb(98, 22, 1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  /* .img-card do CSS da Web */
  imgCardContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20, // margin-right: 1.5em
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  imgCard: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  placeholderImg: {
    backgroundColor: "#E0E0E0",
  },
  /* .nome-restaurante do CSS da Web */
  nomeRestaurante: {
    flex: 1,
    color: "#FFFFFF", // color: white
    fontSize: 22,
    fontWeight: "400", // font-weight: 400
  },
});
