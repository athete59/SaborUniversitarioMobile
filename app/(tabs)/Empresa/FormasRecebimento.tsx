import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderEmpresa from './HeaderEmpresa';
import SideBarEmpresa from './SideBarEmpresa';
import TabRecebimentoPix from './TabRecebimentoPix';
import TabRecebimentoTransferencia from './TabRecebimentoTransferencia';

type TabAtiva = 'pix' | 'transferencia';

export default function FormasRecebimento() {
    const [tabAtiva, setTabAtiva] = useState<TabAtiva>('pix');
    const [sidebarAberta, setSidebarAberta] = useState(false);

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
                <View style={styles.boxFormaRecebi}>
                    <Text style={styles.tituloSecao}>Formas de Recebimento</Text>

                    {/* Barra de Abas */}
                    <View style={styles.navAbas}>
                        <TouchableOpacity
                            onPress={() => setTabAtiva('pix')}
                            style={[styles.tabItem, tabAtiva === 'pix' && styles.tabItemAtiva]}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabTexto, tabAtiva === 'pix' && styles.tabTextoAtivo]}>
                                Pix
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setTabAtiva('transferencia')}
                            style={[styles.tabItem, tabAtiva === 'transferencia' && styles.tabItemAtiva]}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.tabTexto, tabAtiva === 'transferencia' && styles.tabTextoAtivo]}>
                                Transferência
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Conteúdo da Aba Selecionada */}
                    <View style={styles.outlet}>
                        {tabAtiva === 'pix' ? <TabRecebimentoPix /> : <TabRecebimentoTransferencia />}
                    </View>
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
    boxFormaRecebi: {
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    tituloSecao: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FF7124',
        marginBottom: 16,
    },
    navAbas: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#E5E7EB',
        marginBottom: 16,
        gap: 20,
    },
    tabItem: {
        paddingBottom: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabItemAtiva: {
        borderBottomColor: '#FF7124',
    },
    tabTexto: {
        fontSize: 17,
        fontWeight: '600',
        color: '#6B7280',
    },
    tabTextoAtivo: {
        color: '#FF7124',
    },
    outlet: {
        width: '100%',
    },
});
