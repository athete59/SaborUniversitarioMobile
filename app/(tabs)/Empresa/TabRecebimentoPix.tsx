import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';

export type TipoChave = 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Chave Aleatória';

export interface ChavePix {
    id: number;
    tipo: TipoChave;
    valor: string;
    ativo: boolean;
}

const tiposChave: TipoChave[] = ['CPF', 'CNPJ', 'Email', 'Telefone', 'Chave Aleatória'];

/**
 * Aba de gerenciamento e cadastro de chaves PIX para recebimento da empresa.
 */
export default function TabRecebimentoPix() {
    const [chaves, setChaves] = useState<ChavePix[]>([
        { id: 1, tipo: 'CPF', valor: '128.704.787-61', ativo: true },
        { id: 2, tipo: 'Email', valor: 'contato@saboruniversitario.com', ativo: true },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState<ChavePix | null>(null);
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoChave>('CPF');
    const [valorChave, setValorChave] = useState('');

    /**
     * Prepara e exibe o modal de inclusão ou alteração de chave PIX.
     * @param chave Chave a ser editada ou null para novo cadastro
     */
    const handleAbrirModal = (chave: ChavePix | null = null) => {
        if (chave) {
            setEditando(chave);
            setTipoSelecionado(chave.tipo);
            setValorChave(chave.valor);
        } else {
            setEditando(null);
            setTipoSelecionado('CPF');
            setValorChave('');
        }
        setShowModal(true);
    };

    /**
     * Fecha o modal de formulário e limpa os estados transitórios.
     */
    const handleFecharModal = () => {
        setShowModal(false);
        setEditando(null);
        setTipoSelecionado('CPF');
        setValorChave('');
    };

    /**
     * Salva as alterações da chave em edição ou inclui um novo registro no estado.
     */
    const handleSalvarChave = () => {
        if (!valorChave.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha o valor da chave PIX.');
            return;
        }

        if (editando) {
            setChaves(
                chaves.map((c) =>
                    c.id === editando.id
                        ? { ...c, tipo: tipoSelecionado, valor: valorChave.trim() }
                        : c
                )
            );
        } else {
            const novaChave: ChavePix = {
                id: Date.now(),
                tipo: tipoSelecionado,
                valor: valorChave.trim(),
                ativo: true,
            };
            setChaves([...chaves, novaChave]);
        }

        handleFecharModal();
    };

    /**
     * Exibe confirmação de exclusão e remove a chave PIX selecionada.
     * @param id Identificador da chave a excluir
     */
    const handleDeleteChave = (id: number) => {
        Alert.alert(
            'Confirmar exclusão',
            'Tem certeza que deseja deletar esta chave?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Deletar',
                    style: 'destructive',
                    onPress: () => setChaves(chaves.filter((c) => c.id !== id)),
                },
            ]
        );
    };

    /**
     * Retorna o emoji ilustrativo de acordo com o tipo de chave PIX.
     * @param tipo Tipo da chave (CPF, CNPJ, Email, Telefone, Chave Aleatória)
     */
    const getIconoTipo = (tipo: TipoChave): string => {
        switch (tipo) {
            case 'CPF':
                return '🆔';
            case 'CNPJ':
                return '🏢';
            case 'Email':
                return '✉️';
            case 'Telefone':
                return '📱';
            case 'Chave Aleatória':
                return '🔑';
            default:
                return '💳';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Chaves cadastradas</Text>

            <View style={styles.lista}>
                {chaves.length > 0 ? (
                    chaves.map((chave) => (
                        <View key={chave.id} style={styles.chaveCard}>
                            <Text style={styles.chaveIcone}>{getIconoTipo(chave.tipo)}</Text>

                            <View style={styles.chaveInfo}>
                                <Text style={styles.chaveTipo}>{chave.tipo}</Text>
                                <Text style={styles.chaveValor} numberOfLines={1} ellipsizeMode="middle">
                                    {chave.valor}
                                </Text>
                            </View>

                            <View style={styles.chaveAcoes}>
                                <TouchableOpacity
                                    style={styles.btnAcao}
                                    onPress={() => handleAbrirModal(chave)}
                                    accessibilityLabel="Editar chave"
                                >
                                    <Feather name="edit-2" size={17} color="#FF7124" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnAcao}
                                    onPress={() => handleDeleteChave(chave.id)}
                                    accessibilityLabel="Excluir chave"
                                >
                                    <Feather name="trash-2" size={17} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.vazio}>
                        <Text style={styles.vazioTexto}>Nenhuma chave PIX cadastrada.</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.btnCadastrar} onPress={() => handleAbrirModal()} activeOpacity={0.8}>
                <Feather name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.btnCadastrarTexto}>Cadastrar nova chave</Text>
            </TouchableOpacity>

            {/* MODAL RESPONSIVO */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={handleFecharModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitulo}>
                                {editando ? 'Editar Chave PIX' : 'Cadastrar Nova Chave PIX'}
                            </Text>
                            <TouchableOpacity onPress={handleFecharModal} hitSlop={10}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} bounces={false}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Tipo de Chave</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        style={styles.picker}
                                        selectedValue={tipoSelecionado}
                                        onValueChange={(valor: TipoChave) => setTipoSelecionado(valor)}
                                    >
                                        {tiposChave.map((tipo) => (
                                            <Picker.Item key={tipo} label={tipo} value={tipo} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Valor da Chave</Text>
                                <TextInput
                                    style={styles.input}
                                    value={valorChave}
                                    onChangeText={setValorChave}
                                    placeholder={`Digite sua chave ${tipoSelecionado}`}
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.btnCancelar} onPress={handleFecharModal}>
                                <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnSalvarModal} onPress={handleSalvarChave}>
                                <Text style={styles.btnSalvarModalTexto}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 8,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 14,
    },
    lista: {
        marginBottom: 16,
    },
    chaveCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
    },
    chaveIcone: {
        fontSize: 24,
        marginRight: 12,
    },
    chaveInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    chaveTipo: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 2,
    },
    chaveValor: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    chaveAcoes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    btnAcao: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    vazio: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    vazioTexto: {
        color: '#6B7280',
        fontSize: 14,
    },
    btnCadastrar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7124',
        borderRadius: 10,
        paddingVertical: 13,
        paddingHorizontal: 16,
        marginBottom: 20,
        gap: 8,
    },
    btnCadastrarTexto: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        width: '100%',
        maxWidth: 420,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitulo: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#111827',
    },
    modalClose: {
        fontSize: 18,
        color: '#9CA3AF',
        fontWeight: 'bold',
        padding: 4,
    },
    modalBody: {
        marginBottom: 12,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        color: '#374151',
    },
    pickerWrapper: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        overflow: 'hidden',
        minHeight: 48,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 15,
        color: '#111827',
        minHeight: 48,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    btnCancelar: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    btnCancelarTexto: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: 15,
    },
    btnSalvarModal: {
        backgroundColor: '#FF7124',
        borderRadius: 8,
        paddingVertical: 11,
        paddingHorizontal: 22,
    },
    btnSalvarModalTexto: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
