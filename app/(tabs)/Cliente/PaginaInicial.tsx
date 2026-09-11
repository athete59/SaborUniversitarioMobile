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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../../../services/supabase";
import Header from "./Header";
import Sidebar from "./SideBar";

interface Empresa {
  id?: number;
  id_empresa?: number;
  idempresa?: number;
  idusuario?: number;
  nome?: string;
  nome_empresa?: string;
  Nome?: string;
  imagem?: string;
  imagem_url?: string;
  url_imagem?: string;
  foto?: string;
  foto_url?: string;
  [key: string]: any;
}

/**
 * Tela inicial do cliente exibindo a lista de estabelecimentos conveniados (empresas).
 */
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
    /**
     * Consulta a lista de estabelecimentos conveniados registrados na tabela empresa no Supabase.
     */
    async function carregarEmpresas() {
      try {
        setCarregando(true);

        // Consulta prioritária na tabela 'empresa' (singular) e fallback para 'empresas' (plural)
        let { data, error } = await supabase.from("empresa").select("*");

        if (error || !data || data.length === 0) {
          const resPlural = await supabase.from("empresas").select("*");
          if (!resPlural.error && resPlural.data && resPlural.data.length > 0) {
            data = resPlural.data;
            error = null;
          }
        }

        if (error && (!data || data.length === 0)) throw error;

        if (data) {
          setEmpresas(data);
        }
      } catch (err) {
        console.error("Erro ao carregar estabelecimentos conveniados:", err);
        Alert.alert("Erro", "Não foi possível carregar os estabelecimentos.");
      } finally {
        setCarregando(false);
      }
    }

    carregarEmpresas();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
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
            // Mapeamento dinâmico para identificar id, nome e a coluna de imagem/foto da empresa
            const idEmpresa =
              item.id ?? item.id_empresa ?? item.idempresa ?? index;
            const nomeEmpresa =
              item.nome || item.nome_empresa || item.Nome || "Estabelecimento";
            const imagemUrl =
              item.imagem_url || item.imagem || item.url_imagem || item.foto_url || item.foto;

            return (
              <TouchableOpacity
                key={idEmpresa}
                style={styles.cardRestaurante}
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/Cliente/Cardapio",
                    params: { id: idEmpresa, nome: nomeEmpresa },
                  } as any)
                }
              >
                {/* Imagem circular do estabelecimento */}
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

                {/* Nome do estabelecimento com a tipografia oficial */}
                <Text
                  style={[
                    styles.nomeRestaurante,
                    gabrielaLoaded && { fontFamily: "Gabriela_400Regular" },
                  ]}
                  numberOfLines={2}
                >
                  {nomeEmpresa}
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
