import {
    BerkshireSwash_400Regular,
    useFonts,
} from "@expo-google-fonts/berkshire-swash";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderEmpresaProps {
  onPressMenu: () => void;
}

export default function HeaderEmpresa({ onPressMenu }: HeaderEmpresaProps) {
  const [fontsLoaded] = useFonts({
    BerkshireSwash: BerkshireSwash_400Regular,
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPressMenu} style={styles.menuButton}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </TouchableOpacity>

      <Text
        style={[styles.title, fontsLoaded && { fontFamily: "BerkshireSwash" }]}
      >
        Sabor Universitário
      </Text>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#222222",
    width: "100%",
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#ffffff",
    fontSize: 35,
    textAlign: "center",
    includeFontPadding: false,
  },
  menuButton: {
    padding: 5,
    justifyContent: "space-between",
    height: 20,
    width: 24,
  },
  line: {
    width: "100%",
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  spacer: {
    width: 24,
  },
});
