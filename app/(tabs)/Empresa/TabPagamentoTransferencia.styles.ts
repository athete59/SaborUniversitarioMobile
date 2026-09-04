import { StyleSheet } from 'react-native';

// Observação: a fonte 'Arbutus Slab' precisa ser carregada via expo-font
// (ou linkada manualmente no projeto) antes de ser usada aqui.
const FONTE = 'Arbutus Slab';

const styles = StyleSheet.create({
    // Equivalente ao .formTrans
    formTrans: {
        marginLeft: 16,
    },

    // Equivalente ao #h2 / .h2pag
    h2Wrapper: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    h2pag: {
        fontFamily: FONTE,
        fontSize: 18,
        marginLeft: 8,
        textDecorationLine: 'underline',
    },

    // Equivalente ao .formTrans > div
    campo: {
        marginBottom: 16,
        marginTop: 16,
        marginLeft: 16,
    },
    label: {
        fontFamily: FONTE,
        fontSize: 14,
        marginBottom: 6,
    },
    obrigatorio: {
        color: '#EF4444',
    },

    // Equivalente ao .formTrans input, select
    input: {
        backgroundColor: '#D9D9D9',
        padding: 11,
        borderRadius: 8,
        width: '90%',
        maxWidth: 300,
        fontFamily: FONTE,
    },
    inputTitular: {
        // Equivalente ao #titular (sem maxWidth fixo de 600px, adaptado pra mobile)
        backgroundColor: '#D9D9D9',
        padding: 11,
        borderRadius: 8,
        width: '90%',
        fontFamily: FONTE,
    },
    pickerWrapper: {
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        width: '90%',
        maxWidth: 300,
        overflow: 'hidden',
    },
    picker: {
        fontFamily: FONTE,
        width: '100%',
    },

    // Equivalente ao .bloco
    bloco: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginLeft: 16,
    },
    blocoItem: {
        marginRight: 24,
        marginBottom: 16,
    },

    // Equivalente ao .salva / .salva:hover
    salva: {
        backgroundColor: '#FF7124',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000000',
        paddingVertical: 11,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        maxWidth: 300,
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 32,
    },
    salvaTexto: {
        color: '#FFFFFF',
        fontFamily: FONTE,
        fontWeight: '500',
        fontSize: 16,
    },
});

export default styles;
