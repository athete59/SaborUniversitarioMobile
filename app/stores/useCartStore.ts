import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ItemCarrinho {
    id: string | number;
    nome: string;
    preco: number | string;
    quantidade: number;
    imagem?: string;
}

interface CartStore {
    carrinho: ItemCarrinho[];
    adicionarItem: (produto: ItemCarrinho) => void;
    alterarQuantidade: (index: number, delta: number) => void;
    limparCarrinho: () => void;
    obterTotalItens: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            carrinho: [],

            adicionarItem: (produto) => {
                const { carrinho } = get();
                const index = carrinho.findIndex((item) => String(item.id) === String(produto.id));

                if (index > -1) {
                    const atualizado = [...carrinho];
                    atualizado[index].quantidade += 1;
                    set({ carrinho: atualizado });
                } else {
                    set({ carrinho: [...carrinho, { ...produto, quantidade: 1 }] });
                }
            },

            alterarQuantidade: (index, delta) => {
                const { carrinho } = get();
                const atualizado = [...carrinho];
                const novaQtd = atualizado[index].quantidade + delta;

                if (novaQtd <= 0) {
                    atualizado.splice(index, 1);
                } else {
                    atualizado[index].quantidade = novaQtd;
                }

                set({ carrinho: atualizado });
            },

            limparCarrinho: () => set({ carrinho: [] }),

            obterTotalItens: () => {
                return get().carrinho.reduce((soma, item) => soma + item.quantidade, 0);
            },
        }),
        {
            name: '@sabor_universitario:carrinho',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);