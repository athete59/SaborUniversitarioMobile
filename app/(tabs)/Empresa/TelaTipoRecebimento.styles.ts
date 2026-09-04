import { StyleSheet } from 'react-native';

// Observação: a fonte 'Arbutus Slab' precisa ser carregada via expo-font
// (ou linkada manualmente no projeto) antes de ser usada aqui.
const FONTE = 'Arbutus Slab';

const styles = StyleSheet.create({
    // Equivalente ao .BoxFormaRecebi
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    boxFormaRecebi: {
        fontFamily: FONTE,
        marginVertical: 32,
        marginHorizontal: 24,
    },

    // Equivalente ao .FormaRecebiH2
    formaRecebiH2: {
        fontFamily: FONTE,
        fontSize: 20,
        fontWeight: '600',
        padding: 8,
        borderRadius: 10,
        color: '#392100',
    },

    // Equivalente ao .nav / .nav li / .nav li.active
    nav: {
        flexDirection: 'row',
        marginTop: 16,
        borderRadius: 2,
    },
    navItem: {
        marginLeft: 16,
        paddingBottom: 6,
        borderBottomWidth: 3,
        borderBottomColor: '#D1D5DB',
    },
    navItemActive: {
        borderBottomColor: '#FA7E31',
    },
    navText: {
        fontFamily: FONTE,
        fontSize: 20,
        color: '#374151',
    },
    navTextActive: {
        color: '#FA7E31',
    },

    outlet: {
        marginTop: 16,
    },

    // Equivalente ao .tab h4 / .tab h5 (caso use em outro lugar da tela)
    tabTituloDestaque: {
        color: '#FF9F64',
    },
    tabSubtitulo: {
        color: '#828282',
        fontWeight: 'bold',
    },
});

export default styles;
