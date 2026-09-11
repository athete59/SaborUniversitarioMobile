import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import HeaderEmpresa from './HeaderEmpresa';
import SideBarEmpresa from './SideBarEmpresa';

const STORAGE_KEY = '@sabor_universitario:formas_pagamento_empresa';

/**
 * Tela para configuração das formas de pagamento aceitas pela empresa dos clientes.
 */
export default function FormasPagamento() {
    const [sidebarAberta, setSidebarAberta] = useState(false);

    // Estados das opções de pagamento aceitas pela empresa
    const [aceitaDinheiro, setAceitaDinheiro] = useState(true);
    const [aceitaCartao, setAceitaCartao] = useState(true);
    const [aceitaPix, setAceitaPix] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        /**
         * Carrega as opções de pagamento salvas no AsyncStorage do dispositivo.
         */
        async function carregarPreferencias() {
            try {
                const salvas = await AsyncStorage.getItem(STORAGE_KEY);
                if (salvas) {
                    const parsed = JSON.parse(salvas);
                    if (parsed.aceitaDinheiro !== undefined) setAceitaDinheiro(parsed.aceitaDinheiro);
                    if (parsed.aceitaCartao !== undefined) setAceitaCartao(parsed.aceitaCartao);
                    if (parsed.aceitaPix !== undefined) setAceitaPix(parsed.aceitaPix);
                }
            } catch (err) {
                console.log('Erro ao carregar formas de pagamento:', err);
            }
        }
        carregarPreferencias();
    }, []);

    /**
     * Persiste as formas de pagamento selecionadas no armazenamento local.
     */
    const salvarPreferencias = async () => {
        try {
            setSalvando(true);
            const dados = {
                aceitaDinheiro,
                aceitaCartao,
                aceitaPix,
            };
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
            Alert.alert('Sucesso', 'Formas de pagamento atualizadas com sucesso!');
        } catch {
            Alert.alert('Erro', 'Não foi possível salvar as configurações.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <HeaderEmpresa onPressMenu={() => setSidebarAberta(true)} />
            <SideBarEmpresa
                sidebarAberta={sidebarAberta}
                setSidebarAberta={setSidebarAberta}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <Text style={styles.titulo}>Formas de Pagamento</Text>
                    <Text style={styles.subtitulo}>
                        Defina quais formas de pagamento seu estabelecimento aceita dos clientes:
                    </Text>

                    {/* Opção: Dinheiro */}
                    <View style={styles.opcaoCard}>
                        <View style={styles.opcaoEsquerda}>
                            <View style={[styles.iconeWrapper, { backgroundColor: '#ECFDF5' }]}>
                                <FontAwesome5 name="money-bill-wave" size={20} color="#10B981" />
                            </View>
                            <View style={styles.opcaoInfo}>
                                <Text style={styles.opcaoTitulo}>Dinheiro</Text>
                                <Text style={styles.opcaoDesc}>Pagamento em espécie na entrega/balcão</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: '#FFB288' }}
                            thumbColor={aceitaDinheiro ? '#FF7124' : '#F3F4F6'}
                            value={aceitaDinheiro}
                            onValueChange={setAceitaDinheiro}
                        />
                    </View>

                    {/* Opção: Cartão de Débito/Crédito */}
                    <View style={styles.opcaoCard}>
                        <View style={styles.opcaoEsquerda}>
                            <View style={[styles.iconeWrapper, { backgroundColor: '#EFF6FF' }]}>
                                <FontAwesome5 name="credit-card" size={20} color="#3B82F6" />
                            </View>
                            <View style={styles.opcaoInfo}>
                                <Text style={styles.opcaoTitulo}>Cartão de Débito/Crédito</Text>
                                <Text style={styles.opcaoDesc}>Maquininha no local de atendimento</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: '#FFB288' }}
                            thumbColor={aceitaCartao ? '#FF7124' : '#F3F4F6'}
                            value={aceitaCartao}
                            onValueChange={setAceitaCartao}
                        />
                    </View>

                    {/* Opção: Pix */}
                    <View style={styles.opcaoCard}>
                        <View style={styles.opcaoEsquerda}>
                            <View style={[styles.iconeWrapper, { backgroundColor: '#FFFBEB' }]}>
                                <Feather name="key" size={20} color="#F59E0B" />
                            </View>
                            <View style={styles.opcaoInfo}>
                                <Text style={styles.opcaoTitulo}>Pix</Text>
                                <Text style={styles.opcaoDesc}>Chave Pix ou QR Code cadastrado</Text>
                            </View>
                        </View>
                        <Switch
                            trackColor={{ false: '#D1D5DB', true: '#FFB288' }}
                            thumbColor={aceitaPix ? '#FF7124' : '#F3F4F6'}
                            value={aceitaPix}
                            onValueChange={setAceitaPix}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.btnSalvar}
                        onPress={salvarPreferencias}
                        disabled={salvando}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.btnSalvarTexto}>
                            {salvando ? 'Salvando...' : 'Salvar Alterações'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7124',
        marginBottom: 6,
    },
    subtitulo: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        lineHeight: 20,
    },
    opcaoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
    },
    opcaoEsquerda: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    iconeWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    opcaoInfo: {
        flex: 1,
    },
    opcaoTitulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
    },
    opcaoDesc: {
        fontSize: 13,
        color: '#6B7280',
    },
    btnSalvar: {
        backgroundColor: '#FF7124',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    btnSalvarTexto: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
