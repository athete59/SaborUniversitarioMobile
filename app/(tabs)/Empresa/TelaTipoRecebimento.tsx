import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import HeaderEmpresa from './HeaderEmpresa'; // ajuste o caminho conforme sua estrutura de pastas (app/(tabs)/Empresa)
import TabPagamentoPix from './TabPagamentoPix';
import TabPagamentoTransferencia from './TabPagamentoTransferencia';
import styles from './TelaTipoRecebimento.styles';

type TabAtiva = 'pix' | 'transferencia';

// Tela unificada: junta Forma_de_Recebimento_TelaPrincipal + Forma_de_RecebimentoTrans
// + TabTipoPagamentoPix em um único componente com abas.
export default function TelaTipoRecebimento() {
    const [tabAtiva, setTabAtiva] = useState<TabAtiva>('pix');

    return (
        <ScrollView style={styles.container}>
            <HeaderEmpresa />

            <View style={styles.boxFormaRecebi}>
                <Text style={styles.formaRecebiH2}>Forma de Recebimento</Text>

                <View style={styles.nav}>
                    <TouchableOpacity
                        onPress={() => setTabAtiva('pix')}
                        style={[styles.navItem, tabAtiva === 'pix' && styles.navItemActive]}
                    >
                        <Text style={[styles.navText, tabAtiva === 'pix' && styles.navTextActive]}>
                            Pix
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setTabAtiva('transferencia')}
                        style={[styles.navItem, tabAtiva === 'transferencia' && styles.navItemActive]}
                    >
                        <Text style={[styles.navText, tabAtiva === 'transferencia' && styles.navTextActive]}>
                            Transferência
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.outlet}>
                    {tabAtiva === 'pix' ? <TabPagamentoPix /> : <TabPagamentoTransferencia />}
                </View>
            </View>
        </ScrollView>
    );
}
