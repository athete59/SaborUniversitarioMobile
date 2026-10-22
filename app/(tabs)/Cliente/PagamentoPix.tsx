import React, { useState, useEffect, useRef } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

import Header from "./Header";
import Sidebar from "./SideBar";
import { supabase } from "../../../services/supabase";

// ===== Lógica do Pix (contador, status e resposta da função) =====
/** Mesma duração usada pela Edge Function criar-pix (expiresIn). */
const DURACAO_PIX_SEGUNDOS = 900;
/** Teto de segurança: nenhum Pix deve valer mais que isso. */
const LIMITE_MAXIMO_SEGUNDOS = 3600;
/** Quando faltar isso ou menos, o contador entra em alerta. */
const SEGUNDOS_ALERTA = 60;

type SituacaoTimer = "normal" | "alerta" | "expirado";

type RespostaPix =
    | { ok: true; brCode: string; expiraEm: number }
    | { ok: false; motivo: string };

/** expo-router pode entregar um parâmetro como string ou como array de strings. */
function primeiroValor(valor: unknown): unknown {
    return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Pedido Pix nasce "Pendente". Se saiu de "Pendente" (e não foi cancelado),
 * o pagamento caiu (o webhook muda o status para "Em preparo").
 */
function statusEhPago(status: unknown): boolean {
    const s = String(status ?? "").trim().toLowerCase();
    return s !== "" && s !== "pendente" && s !== "cancelado";
}

/**
 * Converte "expira em N segundos" (vindo do servidor) num horário absoluto
 * no relógio DO APARELHO. Isso evita erro quando o relógio do celular está
 * adiantado ou atrasado em relação ao servidor.
 */
function calcularExpiracao(segundos: unknown, agora: number = Date.now()): number {
    const bruto = typeof segundos === "string" && segundos.trim() !== "" ? Number(segundos) : segundos;
    const valido = typeof bruto === "number" && Number.isFinite(bruto) && bruto > 0;
    const duracao = valido ? Math.min(bruto as number, LIMITE_MAXIMO_SEGUNDOS) : DURACAO_PIX_SEGUNDOS;
    return agora + duracao * 1000;
}

/**
 * Lê o parâmetro "expiraEm" (timestamp em ms, como texto) recebido pela tela.
 * Se estiver ausente ou inválido, assume a duração padrão a partir de agora.
 * Se já estiver no passado, mantém (a tela abre como "expirado").
 */
function resolverExpiracao(param: unknown, agora: number = Date.now()): number {
    const padrao = agora + DURACAO_PIX_SEGUNDOS * 1000;
    const bruto = primeiroValor(param);

    let ms: number | null = null;
    if (typeof bruto === "number" && Number.isFinite(bruto)) {
        ms = bruto;
    } else if (typeof bruto === "string" && bruto.trim() !== "") {
        const texto = bruto.trim();
        const n = /^\d+$/.test(texto) ? Number(texto) : Date.parse(texto);
        if (Number.isFinite(n)) ms = n;
    }

    if (ms === null || ms <= 0) return padrao;
    if (ms > agora + LIMITE_MAXIMO_SEGUNDOS * 1000) return padrao; // dado absurdo
    return ms;
}

/** Segundos que faltam (arredonda para cima; nunca negativo). */
function calcularSegundosRestantes(expiraEm: number, agora: number = Date.now()): number {
    if (!Number.isFinite(expiraEm) || !Number.isFinite(agora)) return 0;
    return Math.max(0, Math.ceil((expiraEm - agora) / 1000));
}

/** 65 -> "01:05". Valores inválidos viram "00:00". */
function formatarTempo(segundos: number): string {
    const total = Number.isFinite(segundos) ? Math.max(0, Math.floor(segundos)) : 0;
    const mm = String(Math.floor(total / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    return `${mm}:${ss}`;
}

function situacaoDoTimer(segundos: number): SituacaoTimer {
    if (!(segundos > 0)) return "expirado";
    if (segundos <= SEGUNDOS_ALERTA) return "alerta";
    return "normal";
}

/** Para a barra de progresso: 0 a 1. */
function proporcaoRestante(segundos: number, total: number = DURACAO_PIX_SEGUNDOS): number {
    if (!(total > 0) || !Number.isFinite(segundos)) return 0;
    return Math.min(1, Math.max(0, segundos / total));
}

/** Interpreta o que a Edge Function criar-pix devolveu. */
function interpretarRespostaPix(data: unknown, agora: number = Date.now()): RespostaPix {
    if (data === null || typeof data !== "object") {
        return { ok: false, motivo: "Resposta vazia do servidor." };
    }

    const d = data as Record<string, unknown>;
    const brCode = typeof d.brCode === "string" ? d.brCode.trim() : "";

    if (brCode === "") {
        const motivo = typeof d.error === "string" && d.error.trim() !== ""
            ? d.error
            : "O servidor não devolveu o código Pix.";
        return { ok: false, motivo };
    }

    return { ok: true, brCode, expiraEm: calcularExpiracao(d.expiraEmSegundos, agora) };
}

export default function PagamentoPix() {
    const router = useRouter();
    const params = useLocalSearchParams();

    const [sidebarAberta, setSidebarAberta] = useState(false);
    const [copiado, setCopiado] = useState(false);
    const [statusPagamento, setStatusPagamento] = useState<"pendente" | "pago">("pendente");

    // Recebe os parâmetros enviados pela tela ResumoPedido
    const pedidoId = primeiroValor(params.pedidoId) as string | undefined;

    // Código atual e horário de expiração (mudam quando o cliente gera um novo Pix)
    const [brCode, setBrCode] = useState<string>(String(primeiroValor(params.brCode) ?? ""));
    const [expiraEm, setExpiraEm] = useState<number>(() => resolverExpiracao(params.expiraEm));
    const [agora, setAgora] = useState<number>(() => Date.now());
    const [gerandoNovo, setGerandoNovo] = useState(false);

    const segundosRestantes = calcularSegundosRestantes(expiraEm, agora);
    const situacao = situacaoDoTimer(segundosRestantes);
    const expirado = situacao === "expirado";
    const emAlerta = situacao === "alerta";

    // Contador: recalcula a cada segundo a partir do horário absoluto,
    // então continua correto mesmo se o app ficar em segundo plano.
    useEffect(() => {
        if (statusPagamento !== "pendente" || expirado) return;
        const timer = setInterval(() => setAgora(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [statusPagamento, expirado]);

    // Selo de sucesso: um único "pulo" quando o pagamento é confirmado
    const escalaSelo = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (statusPagamento === "pago") {
            Animated.spring(escalaSelo, {
                toValue: 1,
                friction: 5,
                tension: 90,
                useNativeDriver: true,
            }).start();
        }
    }, [statusPagamento]);

    // Detecta a aprovação do pagamento.
    // Continua rodando mesmo depois de expirar: se o cliente pagou no último segundo,
    // a confirmação ainda chega e a tela vira "Pagamento aprovado".
    useEffect(() => {
        if (!pedidoId) {
            console.warn("pedidoId não recebido - verificação de pagamento não será iniciada.");
            return;
        }

        let ativo = true;
        let intervalo: ReturnType<typeof setInterval> | null = null;

        const marcarComoPago = () => {
            if (!ativo) return;
            setStatusPagamento("pago");
            if (intervalo) clearInterval(intervalo);
        };

        // Checagem manual
        const verificarStatus = async () => {
            const { data, error } = await supabase
                .from("pedidos")
                .select("status")
                .eq("id", pedidoId)
                .single();

            if (error) {
                console.warn("Erro ao consultar status do pedido:", error.message);
                return;
            }
            if (statusEhPago(data?.status)) marcarComoPago();
        };

        // 1. Checa ao abrir a tela
        verificarStatus();

        // 2. Fallback de segurança: checa a cada 3 segundos
        intervalo = setInterval(verificarStatus, 3000);

        // 3. Supabase Realtime (Atualização instantânea)
        const channel = supabase
            .channel(`pedido-listener-${pedidoId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "pedidos",
                    filter: `id=eq.${pedidoId}`,
                },
                (payload: any) => {
                    console.log("Realtime: Status atualizado:", payload.new);
                    if (statusEhPago(payload.new?.status)) marcarComoPago();
                }
            )
            .subscribe();

        return () => {
            ativo = false;
            if (intervalo) clearInterval(intervalo);
            supabase.removeChannel(channel);
        };
    }, [pedidoId]);

    const copiarPix = async () => {
        if (!brCode || expirado) return;
        await Clipboard.setStringAsync(brCode);
        setCopiado(true);
        Alert.alert("Sucesso", "Código Pix copiado para a área de transferência!");
        setTimeout(() => setCopiado(false), 3000);
    };

    // Pix vencido: pede um código novo para o MESMO pedido (que continua Pendente)
    const gerarNovoPix = async () => {
        if (gerandoNovo) return; // evita toque duplo gerar duas cobranças
        if (!pedidoId) {
            Alert.alert("Erro", "Não foi possível identificar o pedido. Volte e tente de novo.");
            return;
        }

        setGerandoNovo(true);
        try {
            const { data, error } = await supabase.functions.invoke("criar-pix", {
                body: { pedidoId: Number(pedidoId) },
            });

            const resposta = interpretarRespostaPix(data);
            if (error || !resposta.ok) {
                let motivo = resposta.ok ? "" : resposta.motivo;
                try {
                    const corpo = await (error as any)?.context?.json();
                    if (typeof corpo?.error === "string") motivo = corpo.error;
                } catch { }
                console.error("criar-pix falhou ao gerar novo Pix:", motivo || error?.message);
                Alert.alert(
                    "Não foi possível gerar um novo Pix",
                    motivo || "Tente novamente em instantes."
                );
                return;
            }

            setBrCode(resposta.brCode);
            setExpiraEm(resposta.expiraEm);
            setAgora(Date.now());
            setCopiado(false);
        } finally {
            setGerandoNovo(false);
        }
    };

    const proporcao = proporcaoRestante(segundosRestantes, DURACAO_PIX_SEGUNDOS);
    const larguraBarra = `${Math.round(proporcao * 100)}%` as `${number}%`;

    return (
        <View style={styles.container}>
            <Header sidebarAberta={sidebarAberta} setSidebarAberta={setSidebarAberta} />
            <Sidebar sidebarAberta={sidebarAberta} setSidebarAberta={setSidebarAberta} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.subTitulo}>Restaurante universitário</Text>

                <View style={styles.cardBege}>
                    {statusPagamento === "pendente" && (
                        <View style={styles.cardTopo}>
                            <TouchableOpacity
                                style={styles.btnVoltar}
                                onPress={() => router.replace("/(tabs)/Cliente/PaginaInicial" as any)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.btnVoltarTexto}>← Voltar</Text>
                            </TouchableOpacity>

                            <View style={styles.statusBadge}>
                                <Text style={styles.statusTexto}>
                                    {expirado ? "Pix expirado" : "Aguardando pagamento"}
                                </Text>
                            </View>
                        </View>
                    )}

                    {statusPagamento === "pago" ? (
                        <View style={styles.sucessoContainer}>
                            <Animated.View
                                style={[
                                    styles.seloSucesso,
                                    { transform: [{ scale: escalaSelo }], opacity: escalaSelo },
                                ]}
                            >
                                <Text style={styles.seloSucessoCheck}>✓</Text>
                            </Animated.View>

                            <Text style={styles.sucessoTitulo}>Pagamento aprovado</Text>
                            <Text style={styles.sucessoSubtitulo}>
                                Seu pedido já está em preparo. Você acompanha cada etapa em Meus pedidos.
                            </Text>

                            <View style={styles.sucessoResumo}>
                                <View style={styles.sucessoResumoLinha}>
                                    <Text style={styles.sucessoResumoRotulo}>Pedido</Text>
                                    <Text style={styles.sucessoResumoValor}>nº {pedidoId}</Text>
                                </View>
                                <View style={styles.sucessoResumoLinha}>
                                    <Text style={styles.sucessoResumoRotulo}>Forma de pagamento</Text>
                                    <Text style={styles.sucessoResumoValor}>Pix</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.btnPrimario}
                                onPress={() => router.replace("/(tabs)/Cliente/MeusPedidos" as any)}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.btnPrimarioTexto}>Acompanhar pedido</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.replace("/(tabs)/Cliente/PaginaInicial" as any)}
                                activeOpacity={0.7}
                                style={styles.btnSecundario}
                            >
                                <Text style={styles.btnSecundarioTexto}>Voltar ao início</Text>
                            </TouchableOpacity>
                        </View>
                    ) : expirado ? (
                        <View style={styles.expiradoContainer}>
                            <View style={styles.expiradoSelo}>
                                <Text style={styles.expiradoSeloTexto}>!</Text>
                            </View>

                            <Text style={styles.expiradoTitulo}>Este Pix expirou</Text>
                            <Text style={styles.expiradoTexto}>
                                O código deixou de valer e nada foi cobrado. Gere um novo para concluir o pedido.
                            </Text>
                            <Text style={styles.expiradoDica}>
                                Se você já pagou, aguarde alguns segundos: a confirmação aparece aqui sozinha.
                            </Text>

                            <TouchableOpacity
                                style={[styles.btnPrimario, gerandoNovo && styles.btnDesabilitado]}
                                onPress={gerarNovoPix}
                                disabled={gerandoNovo}
                                activeOpacity={0.85}
                            >
                                {gerandoNovo ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.btnPrimarioTexto}>Gerar novo Pix</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.replace("/(tabs)/Cliente/PaginaInicial" as any)}
                                activeOpacity={0.7}
                                style={styles.btnSecundario}
                            >
                                <Text style={styles.btnSecundarioTexto}>Voltar ao início</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.pixTitulo}>PIX</Text>

                            {brCode ? (
                                <>
                                    <View style={styles.timerBox}>
                                        <Text style={styles.timerRotulo}>Este código expira em</Text>
                                        <Text style={[styles.timerValor, emAlerta && styles.timerValorAlerta]}>
                                            {formatarTempo(segundosRestantes)}
                                        </Text>
                                        <View style={styles.timerTrilha}>
                                            <View
                                                style={[
                                                    styles.timerBarra,
                                                    { width: larguraBarra },
                                                    emAlerta && styles.timerBarraAlerta,
                                                ]}
                                            />
                                        </View>
                                        {emAlerta && (
                                            <Text style={styles.timerAviso}>
                                                Falta pouco. Pague agora ou gere um novo código.
                                            </Text>
                                        )}
                                    </View>

                                    <View style={styles.qrSection}>
                                        <View style={styles.qrCodeBox}>
                                            {/* O QR Code é gerado automaticamente a partir do brCode bruto */}
                                            <QRCode value={brCode} size={150} color="#000000" backgroundColor="#FFFFFF" />
                                        </View>
                                        <Text style={styles.instrucaoTexto}>
                                            Aponte a sua câmera para o QR Code ao lado ou use o código abaixo do Pix Copia e Cola.
                                        </Text>
                                    </View>

                                    <View style={styles.pixCodeBox}>
                                        <Text style={styles.pixCodeTexto} numberOfLines={3}>{brCode}</Text>
                                    </View>

                                    <TouchableOpacity style={styles.btnCopiar} onPress={copiarPix} activeOpacity={0.8}>
                                        <Text style={styles.btnCopiarTexto}>{copiado ? "Código Copiado!" : "Copiar código pix"}</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <Text style={styles.erroQrTexto}>
                                    Não foi possível carregar o código Pix. Volte e gere o pedido novamente.
                                </Text>
                            )}
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFFFFF" },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 40, alignItems: "center" },
    subTitulo: { fontFamily: "ArbutusSlab_400Regular", fontSize: 20, color: "#F5670E", textAlign: "center", marginVertical: 16 },
    cardBege: { backgroundColor: "#FCE5CD", borderRadius: 16, width: "100%", padding: 16, alignItems: "center" },
    cardTopo: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    btnVoltar: { paddingVertical: 4, paddingRight: 8 },
    btnVoltarTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 16, color: "#F5670E", fontWeight: "bold" },
    statusBadge: { backgroundColor: "#F9CB9C", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
    statusTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 13, color: "#274E13", fontWeight: "bold" },
    pixTitulo: { fontFamily: "ArbutusSlab_400Regular", fontSize: 22, color: "#000000", fontWeight: "bold", marginBottom: 12 },

    // Contador regressivo
    timerBox: { width: "100%", alignItems: "center", marginBottom: 16 },
    timerRotulo: { fontFamily: "ArbutusSlab_400Regular", fontSize: 14, color: "#5A3A22" },
    timerValor: { fontFamily: "Belanosima_700Bold", fontSize: 38, color: "#B84A06", marginVertical: 2 },
    timerValorAlerta: { color: "#A61C00" },
    timerTrilha: { width: "100%", height: 6, borderRadius: 3, backgroundColor: "#F9CB9C", overflow: "hidden", marginTop: 4 },
    timerBarra: { height: "100%", borderRadius: 3, backgroundColor: "#F5670E" },
    timerBarraAlerta: { backgroundColor: "#A61C00" },
    timerAviso: { fontFamily: "ArbutusSlab_400Regular", fontSize: 13, color: "#A61C00", textAlign: "center", marginTop: 8 },

    qrSection: { width: "100%", alignItems: "center", gap: 16, marginBottom: 16 },
    qrCodeBox: { backgroundColor: "#FFFFFF", padding: 12, borderRadius: 12, borderWidth: 2, borderColor: "#F5670E" },
    instrucaoTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 14, color: "#000000", textAlign: "center", lineHeight: 20, paddingHorizontal: 8 },
    pixCodeBox: { backgroundColor: "#FF6B2C", borderRadius: 12, padding: 12, width: "100%", marginBottom: 16 },
    pixCodeTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 11, color: "#FFFFFF", textAlign: "center" },
    btnCopiar: { backgroundColor: "#F9CB9C", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    btnCopiarTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 14, color: "#A64D79" },
    erroQrTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 15, color: "#A61C00", textAlign: "center", paddingVertical: 16, paddingHorizontal: 8 },

    // Pix expirado
    expiradoContainer: { width: "100%", alignItems: "center", paddingTop: 8, paddingBottom: 8 },
    expiradoSelo: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#F9CB9C", borderWidth: 3, borderColor: "#A61C00", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    expiradoSeloTexto: { fontFamily: "Belanosima_700Bold", fontSize: 40, color: "#A61C00", lineHeight: 46 },
    expiradoTitulo: { fontFamily: "Belanosima_700Bold", fontSize: 26, color: "#A61C00", textAlign: "center", marginBottom: 8 },
    expiradoTexto: { fontFamily: "ArbutusSlab_400Regular", fontSize: 15, lineHeight: 23, color: "#5A3A22", textAlign: "center", paddingHorizontal: 8, marginBottom: 10 },
    expiradoDica: { fontFamily: "ArbutusSlab_400Regular", fontSize: 13, lineHeight: 20, color: "#7A5A42", textAlign: "center", paddingHorizontal: 8, marginBottom: 22 },

    // Pagamento aprovado
    sucessoContainer: { width: "100%", alignItems: "center", paddingTop: 12, paddingBottom: 8 },
    seloSucesso: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#2E7D32", alignItems: "center", justifyContent: "center", marginBottom: 20, shadowColor: "#2E7D32", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
    seloSucessoCheck: { fontSize: 52, color: "#FFFFFF", fontWeight: "bold", lineHeight: 58 },
    sucessoTitulo: { fontFamily: "Belanosima_700Bold", fontSize: 28, color: "#0e9a19", textAlign: "center", marginBottom: 8 },
    sucessoSubtitulo: { fontFamily: "ArbutusSlab_400Regular", fontSize: 15, lineHeight: 23, color: "#5A3A22", textAlign: "center", paddingHorizontal: 8, marginBottom: 20 },
    sucessoResumo: { width: "100%", backgroundColor: "rgba(255, 255, 255, 0.65)", borderRadius: 12, paddingVertical: 4, paddingHorizontal: 16, marginBottom: 24 },
    sucessoResumoLinha: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 },
    sucessoResumoRotulo: { fontFamily: "ArbutusSlab_400Regular", fontSize: 14, color: "#7A5A42" },
    sucessoResumoValor: { fontFamily: "Belanosima_600SemiBold", fontSize: 15, color: "#3A2414" },

    // Botões compartilhados
    btnPrimario: { backgroundColor: "#F5670E", height: 54, borderRadius: 12, width: "100%", alignItems: "center", justifyContent: "center", shadowColor: "#F5670E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
    btnPrimarioTexto: { fontFamily: "Belanosima_600SemiBold", fontSize: 17, color: "#FFFFFF" },
    btnDesabilitado: { opacity: 0.6 },
    btnSecundario: { marginTop: 8, paddingVertical: 14, paddingHorizontal: 20 },
    btnSecundarioTexto: { fontFamily: "Belanosima_600SemiBold", fontSize: 15, color: "#B84A06" },
});