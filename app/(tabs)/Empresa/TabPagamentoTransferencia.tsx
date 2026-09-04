import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from './TabPagamentoTransferencia.styles';

// Lista de bancos usada no Picker (equivalente às <option> do <select> original)
const bancos: string[] = [
    '001 - Banco do Brasil S.A.',
    '003 - Banco da Amazônia S.A.',
    '004 - Banco do Nordeste do Brasil S.A.',
    '007 - Banco Nacional de Desenvolvimento Econômico e Social (BNDES)',
    '012 - Banco Inbursa S.A.',
    '021 - Banco do Estado do Espírito Santo (Banestes)',
    '024 - Banco de Pernambuco (BANDEPE)',
    '025 - Banco Alfa S.A.',
    '029 - Banco Itaú Consignado S.A.',
    '033 - Banco Santander (Brasil) S.A.',
    '036 - Banco Bradesco BBI S.A.',
    '037 - Banco do Estado do Pará (Banpará)',
    '040 - Banco Cargill S.A.',
    '041 - Banrisul — Banco do Estado do Rio Grande do Sul',
    '047 - Banese — Banco do Estado de Sergipe S.A.',
    '062 - Hipercard Banco Múltiplo S.A.',
    '063 - Bradescard S.A.',
    '064 - Goldman Sachs do Brasil Banco Múltiplo S.A.',
    '065 - Banco Andbank (Brasil) S.A.',
    '066 - Banco Morgan Stanley S.A.',
    '069 - Banco Crefisa S.A.',
    '070 - BRB — Banco de Brasília S.A.',
    '074 - Banco J. Safra S.A.',
    '075 - Banco ABN AMRO S.A.',
    '076 - Banco KDB do Brasil S.A.',
    '077 - Banco Inter S.A.',
    '082 - Banco Topázio S.A.',
    '083 - Banco da China Brasil S.A.',
    '094 - Banco Finaxis S.A.',
    '095 - Banco Travelex S.A.',
    '096 - Banco B3 S.A.',
    '102 - XP Investimentos S.A.',
    '104 - Caixa Econômica Federal',
    '107 - BOCOM BBM S.A.',
    '117 - Advanced Corretora de Câmbio Ltda',
    '120 - Banco Rodobens S.A.',
    '121 - Banco Agibank S.A.',
    '128 - Braza Bank S.A.',
    '172 - Albatross CCV S.A.',
    '184 - Itaú BBA S.A.',
    '204 - Bradesco Cartões S.A.',
    '208 - BTG Pactual S.A.',
    '217 - Banco John Deere S.A.',
    '222 - Crédit Agricole Brasil S.A.',
    '233 - Banco Cifra S.A.',
    '241 - Banco Clássico',
    '254 - Paraná Banco S.A.',
    '260 - Nu Pagamentos S.A. (Nubank)',
    '265 - Banco Fator S.A.',
    '269 - HSBC Bank Brasil S.A.',
    '280 - Avista S.A. Crédito',
    '299 - Sorocred Crédito',
    '313 - Amazônia Corretora de Câmbio Ltda',
    '323 - Mercado Pago – Conta do Mercado Livre',
    '336 - Banco C6 S.A.',
    '341 - Itaú Unibanco S.A.',
    '349 - AL5 S.A. Crédito',
    '366 - Société Générale Brasil S.A.',
    '367 - Vitreo Distribuidora de Títulos e Valores Mobiliários S.A.',
    '370 - Banco Mizuho do Brasil S.A.',
    '376 - Banco J. P. Morgan S.A.',
    '389 - Banco Mercantil do Brasil S.A.',
    '394 - Bradesco Financiamentos S.A.',
    '422 - Banco Safra S.A.',
    '456 - Banco MUFG Brasil S.A.',
    '464 - Banco Sumitomo Mitsui Brasileiro S.A.',
    '473 - Caixa Geral – Brasil S.A.',
    '479 - ItaúBank S.A.',
    '487 - Deutsche Bank S.A. – Banco Alemão',
    '505 - Credit Suisse (Brasil) S.A.',
    '610 - Banco VR S.A.',
    '611 - Banco Paulista S.A.',
    '612 - Banco Guanabara S.A.',
    '613 - Omni Banco S.A.',
    '623 - Banco Pan S.A.',
    '630 - Letsbank / Smartbank S.A.',
    '633 - Banco Rendimento S.A.',
    '634 - Banco Triângulo S.A.',
    '643 - Banco Pine S.A.',
    '654 - Banco Digimais S.A.',
    '655 - Banco Votorantim S.A.',
    '712 - Banco Ourinvest S.A.',
    '741 - Banco Ribeirão Preto',
    '743 - Banco Semear S.A.',
    '746 - Banco Modal S.A.',
    '747 - Banco Rabobank International do Brasil S.A.',
    '748 - Sicredi – Sistema de Crédito Cooperativo',
    '751 - Scotiabank Brasil S.A.',
    '755 - Bank of America Merrill Lynch Banco Múltiplo S.A.',
    '756 - Sicoob – Sistema de Cooperativas de Crédito',
    '757 - Banco KEB Hana do Brasil S.A.',
];

type TipoConta = 'contaCorrente' | 'ContaPoupança' | '';

export interface DadosTransferencia {
    titular: string;
    cpf: string;
    banco: string;
    tipoDeConta: TipoConta;
    agencia: string;
    numeroDaConta: string;
}

interface TabPagamentoTransferenciaProps {
    onSalvar?: (dados: DadosTransferencia) => void;
}

// Conversão de Forma_de_RecebimentoTrans para React Native.
// Sem navegação de rota, já que agora é uma aba dentro da TelaTipoRecebimento.
export default function TabPagamentoTransferencia({ onSalvar }: TabPagamentoTransferenciaProps) {
    const [titular, setTitular] = useState('');
    const [cpf, setCpf] = useState('');
    const [banco, setBanco] = useState('');
    const [tipoDeConta, setTipoDeConta] = useState<TipoConta>('');
    const [agencia, setAgencia] = useState('');
    const [numeroDaConta, setNumeroDaConta] = useState('');

    function dadosTransfer() {
        if (!titular || !cpf || !banco || !tipoDeConta || !agencia || !numeroDaConta) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }

        const dados: DadosTransferencia = { titular, cpf, banco, tipoDeConta, agencia, numeroDaConta };

        if (onSalvar) {
            onSalvar(dados);
        } else {
            Alert.alert('Sucesso', 'Dados de transferência salvos.');
        }
    }

    return (
        <View style={styles.formTrans}>
            <View style={styles.h2Wrapper}>
                <Text style={styles.h2pag}>Transferência</Text>
            </View>

            <View style={styles.campo}>
                <Text style={styles.label}>
                    Nome do Titular <Text style={styles.obrigatorio}>*</Text>
                </Text>
                <TextInput
                    style={styles.inputTitular}
                    value={titular}
                    onChangeText={setTitular}
                />
            </View>

            <View style={styles.campo}>
                <Text style={styles.label}>
                    CPF <Text style={styles.obrigatorio}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    value={cpf}
                    onChangeText={setCpf}
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.bloco}>
                <View style={styles.blocoItem}>
                    <Text style={styles.label}>
                        Banco <Text style={styles.obrigatorio}>*</Text>
                    </Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            style={styles.picker}
                            selectedValue={banco}
                            onValueChange={(valor: string) => setBanco(valor)}
                        >
                            <Picker.Item label="Selecione um banco" value="" enabled={false} />
                            {bancos.map((b) => (
                                <Picker.Item key={b} label={b} value={b} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.blocoItem}>
                    <Text style={styles.label}>
                        Tipo de Conta <Text style={styles.obrigatorio}>*</Text>
                    </Text>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            style={styles.picker}
                            selectedValue={tipoDeConta}
                            onValueChange={(valor: TipoConta) => setTipoDeConta(valor)}
                        >
                            <Picker.Item label="Selecione o tipo de conta" value="" enabled={false} />
                            <Picker.Item label="Conta Corrente" value="contaCorrente" />
                            <Picker.Item label="Conta Poupança" value="ContaPoupança" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.bloco}>
                <View style={styles.blocoItem}>
                    <Text style={styles.label}>
                        Agência <Text style={styles.obrigatorio}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={agencia}
                        onChangeText={setAgencia}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.blocoItem}>
                    <Text style={styles.label}>
                        Número da Conta <Text style={styles.obrigatorio}>*</Text>
                    </Text>
                    <TextInput
                        style={styles.input}
                        value={numeroDaConta}
                        onChangeText={setNumeroDaConta}
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.salva}
                onPress={dadosTransfer}
                activeOpacity={0.8}
            >
                <Text style={styles.salvaTexto}>Salvar</Text>
            </TouchableOpacity>
        </View>
    );
}
