import { StyleSheet } from 'react-native';

// Observação: a fonte 'Arbutus Slab' precisa ser carregada via expo-font
// (ou linkada manualmente no projeto) antes de ser usada aqui.
const FONTE = 'Arbutus Slab';

const styles = StyleSheet.create({
    // Equivalente ao .tab-content-pix / .chaves-section
    tabContentPix: {
        paddingHorizontal: 16,
    },
    chavesTitulo: {
        fontFamily: FONTE,
        fontSize: 18,
        fontWeight: '600',
        color: '#392100',
        marginBottom: 12,
    },

    // Equivalente ao .chaves-lista / .chave-item
    chavesLista: {
        marginBottom: 16,
    },
    chaveItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    chaveIcone: {
        fontSize: 22,
        marginRight: 12,
    },
    chaveInfo: {
        flex: 1,
    },
    chaveTipo: {
        fontFamily: FONTE,
        fontSize: 12,
        color: '#828282',
    },
    chaveValor: {
        fontFamily: FONTE,
        fontSize: 15,
        color: '#392100',
    },
    chaveAcoes: {
        flexDirection: 'row',
    },
    btnEditar: {
        padding: 8,
        marginRight: 4,
    },
    btnDeletar: {
        padding: 8,
    },

    // Equivalente ao .chaves-vazio
    chavesVazio: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    chavesVazioTexto: {
        fontFamily: FONTE,
        color: '#828282',
    },

    // Equivalente ao .btn-cadastrar
    btnCadastrar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF7124',
        borderRadius: 10,
        paddingVertical: 11,
        marginBottom: 24,
    },
    btnCadastrarTexto: {
        color: '#FFFFFF',
        fontFamily: FONTE,
        fontWeight: '500',
        fontSize: 16,
        marginLeft: 8,
    },

    // Picker do modal (tipo de chave)
    pickerWrapper: {
        backgroundColor: '#D9D9D9',
        borderRadius: 8,
        overflow: 'hidden',
    },
    picker: {
        fontFamily: FONTE,
        width: '100%',
    },
    inputTitular: {
        backgroundColor: '#D9D9D9',
        padding: 11,
        borderRadius: 8,
        fontFamily: FONTE,
    },

    // Equivalente ao .modal-overlay / .modal-content
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        padding: 16,
    },

    // Equivalente ao .modal-header
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitulo: {
        fontFamily: FONTE,
        fontSize: 16,
        fontWeight: '600',
        color: '#392100',
        flexShrink: 1,
    },
    modalClose: {
        fontSize: 18,
        color: '#828282',
        paddingLeft: 12,
    },

    // Equivalente ao .modal-body / .form-group
    modalBody: {
        marginBottom: 8,
    },
    formGroup: {
        marginBottom: 16,
    },
    formGroupLabel: {
        fontFamily: FONTE,
        fontSize: 14,
        marginBottom: 6,
        color: '#392100',
    },

    // Equivalente ao .modal-footer / .btn-cancelar / .btn-salvar
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    btnCancelar: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 8,
    },
    btnCancelarTexto: {
        fontFamily: FONTE,
        color: '#828282',
    },
    btnSalvarModal: {
        backgroundColor: '#FF7124',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    btnSalvarModalTexto: {
        fontFamily: FONTE,
        color: '#FFFFFF',
        fontWeight: '500',
    },
});

export default styles;
