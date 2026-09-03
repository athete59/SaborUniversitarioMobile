import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

interface CardClienteProps {
  rest: string;
  img: ImageSourcePropType | { uri: string };
  onPress?: () => void;
}

export default function Card_Cliente({ rest, img, onPress }: CardClienteProps) {
  const router = useRouter();

  function abrirRestaurante() {
    if (onPress) {
      onPress();
      return;
    }

    if (rest === "Restaurante Universitário") {
      router.push("/(tabs)/Cliente/Cardapio" as any);
    } else {
      Alert.alert("Aviso", "Esse restaurante ainda não possui página.");
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cardRestaurante,
        pressed && styles.cardPressionado,
      ]}
      onPress={abrirRestaurante}
    >
      <Image
        source={img}
        accessibilityLabel={rest}
        style={styles.imgCard}
        resizeMode="cover"
      />

      <Text style={styles.nomeRestaurante} numberOfLines={2}>
        {rest}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardRestaurante: {
    backgroundColor: "#FF9C72",
    borderRadius: 16,
    padding: 14,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  cardPressionado: {
    backgroundColor: "#ff8754",
  },
  imgCard: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  nomeRestaurante: {
    flex: 1,
    fontSize: 18,
    fontFamily: "InterBold",
    color: "#FFFFFF",
  },
});
