import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons'; // equivalente ao react-icons/fi (Fi = Feather)
import styles from './TabPagamentoPix.styles';

type TipoChave = 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Chave Aleatória';

interface ChavePix {
    id: number;
    tipo: TipoChave;
    valor: string;
    ativo: boolean;
}

const tiposChave: TipoChave[] = ['CPF', 'CNPJ', 'Email', 'Telefone', 'Chave Aleatória'];

// Conversão de TabTipoPagamentoPix.tsx para React Native.
export default function TabPagamentoPix() {
    const [chaves, setChaves] = useState<ChavePix[]>([
        { id: 1, tipo: 'CPF', valor: '128.704.787-61', ativo: true },
        { id: 2, tipo: 'Email', valor: 'alicealencar@gmail.com', ativo: true },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState<ChavePix | null>(null);
    const [tipoSelecionado, setTipoSelecionado] = useState<TipoChave>('CPF');
    const [valorChave, setValorChave] = useState('');

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

    const handleFecharModal = () => {
        setShowModal(false);
        setEditando(null);
        setTipoSelecionado('CPF');
        setValorChave('');
    };

    const handleSalvarChave = () => {
        if (!valorChave.trim()) {
            Alert.alert('Atenção', 'Por favor, preencha a chave PIX');
            return;
        }

        if (editando) {
            setChaves(
                chaves.map((c) =>
                    c.id === editando.id
                        ? { ...c, tipo: tipoSelecionado, valor: valorChave }
                        : c
                )
            );
        } else {
            const novaChave: ChavePix = {
                id: Date.now(),
                tipo: tipoSelecionado,
                valor: valorChave,
                ativo: true,
            };
            setChaves([...chaves, novaChave]);
        }

        handleFecharModal();
    };

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
        <View style={styles.tabContentPix}>
            <Text style={styles.chavesTitulo}>Chaves cadastradas</Text>

            <View style={styles.chavesLista}>
                {chaves.length > 0 ? (
                    chaves.map((chave) => (
                        <View key={chave.id} style={styles.chaveItem}>
                            <Text style={styles.chaveIcone}>{getIconoTipo(chave.tipo)}</Text>

                            <View style={styles.chaveInfo}>
                                <Text style={styles.chaveTipo}>{chave.tipo}</Text>
                                <Text style={styles.chaveValor}>{chave.valor}</Text>
                            </View>

                            <View style={styles.chaveAcoes}>
                                <TouchableOpacity
                                    style={styles.btnEditar}
                                    onPress={() => handleAbrirModal(chave)}
                                >
                                    <Feather name="edit-2" size={16} color="#392100" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnDeletar}
                                    onPress={() => handleDeleteChave(chave.id)}
                                >
                                    <Feather name="trash-2" size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.chavesVazio}>
                        <Text style={styles.chavesVazioTexto}>Nenhuma chave PIX cadastrada</Text>
                    </View>
                )}
            </View>

            <TouchableOpacity style={styles.btnCadastrar} onPress={() => handleAbrirModal()}>
                <Feather name="plus" size={18} color="#FFFFFF" />
                <Text style={styles.btnCadastrarTexto}>Cadastrar nova chave</Text>
            </TouchableOpacity>

            {/* MODAL */}
            <Modal
                visible={showModal}
                transparent
                animationType="fade"
                onRequestClose={handleFecharModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={handleFecharModal}
                >
                    {/* onStartShouldSetResponder evita que o toque dentro do card feche o modal */}
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitulo}>
                                {editando ? 'Editar Chave PIX' : 'Cadastrar Nova Chave PIX'}
                            </Text>
                            <TouchableOpacity onPress={handleFecharModal}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formGroupLabel}>Tipo de Chave</Text>
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
                                <Text style={styles.formGroupLabel}>Valor da Chave</Text>
                                <TextInput
                                    style={styles.inputTitular}
                                    value={valorChave}
                                    onChangeText={setValorChave}
                                    placeholder={`Digite a chave ${tipoSelecionado}`}
                                    autoFocus
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
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
