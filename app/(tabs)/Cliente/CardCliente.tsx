import React from "react";
import {
    Text,
    Image,
    StyleSheet,
    Pressable,
    Alert,
    ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

interface CardClienteProps {
    rest: string;
    img: ImageSourcePropType | { uri: string };
    onPress?: () => void;
}

export default function Card_Cliente({ rest, img, onPress }: CardClienteProps) {
    const navigation = useNavigation<any>();

    function abrirRestaurante() {
        if (onPress) {
            onPress();
            return;
        }

        if (rest === "Restaurante Universitário") {
            navigation.navigate("Home");
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
        borderRadius: 22,
        padding: 13,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        elevation: 4, // Sombra Android
        shadowColor: "rgb(98, 22, 1)", // Sombra iOS
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
    },
    cardPressionado: {
        backgroundColor: "#ff8754",
    },
    imgCard: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginRight: 24,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    nomeRestaurante: {
        flex: 1,
        fontSize: 20,
        fontWeight: "400",
        color: "#FFFFFF",
    },
});