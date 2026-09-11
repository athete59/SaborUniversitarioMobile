import { supabase } from "./supabase";

export type TipoUsuario = "empresa" | "cliente" | "funcionario" | "instituicao";

export interface PerfilEmpresa {
  id: number;
  idusuario: number;
  nome?: string;
  foto_url?: string;
  [key: string]: any;
}

export interface PerfilCliente {
  id: number;
  idusuario: number;
  idbeneficio?: number;
  foto_url?: string;
  [key: string]: any;
}

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
  tipo: TipoUsuario;
  perfil?: any;
}

export interface ResultadoLogin {
  sucesso: boolean;
  usuario?: UsuarioAutenticado;
  erro?: string;
}

/**
 * Autentica o usuário pelo e-mail e senha, verifica o tipo de perfil
 * vinculado no sistema e retorna os dados completos (sem expor a senha).
 */
export async function autenticarUsuario(
  email: string,
  senha: string
): Promise<ResultadoLogin> {
  try {
    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      return { sucesso: false, erro: "Preencha todos os campos obrigatórios." };
    }

    // 1. Consulta o usuário na tabela base 'usuarios'
    const { data: usuario, error: erroUsuario } = await supabase
      .from("usuarios")
      .select("id, nome, email, senha, estado")
      .eq("email", emailLimpo)
      .eq("senha", senhaLimpa)
      .maybeSingle();

    if (erroUsuario) {
      return { sucesso: false, erro: `Erro ao consultar usuário: ${erroUsuario.message}` };
    }

    if (!usuario) {
      return { sucesso: false, erro: "Email ou senha inválidos." };
    }

    if (usuario.estado !== undefined && usuario.estado === 0) {
      return { sucesso: false, erro: "Esta conta está desativada." };
    }

    const idUsuario = usuario.id;

    /**
     * Consulta com segurança um perfil específico no Supabase sem depender de .catch no PostgrestBuilder.
     */
    async function consultarPerfil(tabela: string, id: number) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select("*")
          .eq("idusuario", id)
          .maybeSingle();

        if (error) return null;
        return data;
      } catch {
        return null;
      }
    }

    // 2. Busca os perfis de forma paralela e 100% resiliente em qualquer engine JS
    const [empresaSingular, empresaPlural, cliente, funcionario, funcionarios, instituicao] = await Promise.all([
      consultarPerfil("empresa", idUsuario),
      consultarPerfil("empresas", idUsuario),
      consultarPerfil("clientes", idUsuario),
      consultarPerfil("funcionario", idUsuario),
      consultarPerfil("funcionarios", idUsuario),
      consultarPerfil("instituicao", idUsuario),
    ]);

    let tipo: TipoUsuario = "cliente";
    let perfil: any = null;

    const empresa = empresaSingular || empresaPlural;

    if (empresa) {
      tipo = "empresa";
      perfil = empresa;
    } else if (funcionario || funcionarios) {
      tipo = "funcionario";
      perfil = funcionario || funcionarios;
    } else if (instituicao) {
      tipo = "instituicao";
      perfil = instituicao;
    } else if (cliente) {
      tipo = "cliente";
      perfil = cliente;
    }

    const usuarioAutenticado: UsuarioAutenticado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo,
      perfil,
    };

    return {
      sucesso: true,
      usuario: usuarioAutenticado,
    };
  } catch (err: any) {
    return {
      sucesso: false,
      erro: err?.message || "Ocorreu um erro inesperado durante o login.",
    };
  }
}

/**
 * Retorna a rota inicial da aplicação de acordo com o tipo de usuário.
 * @param tipo Papel do usuário no sistema ('empresa', 'funcionario', 'cliente', 'instituicao')
 */
export function obterRotaInicialPorTipo(tipo: TipoUsuario): string {
  switch (tipo) {
    case "empresa":
      return "/(tabs)/Empresa/Dashboard";
    case "funcionario":
      return "/(tabs)/Funcionario/ScannerPedido";
    case "cliente":
    default:
      return "/(tabs)/Cliente/PaginaInicial";
  }
}

/**
 * Consulta um usuário cadastrado a partir de seu endereço de e-mail.
 * @param email Endereço de e-mail a pesquisar
 */
export async function buscarUsuarioPorEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Atualiza a senha de acesso de um usuário identificado pelo e-mail.
 * @param email E-mail do usuário
 * @param novaSenha Nova senha a ser definida
 */
export async function atualizarSenha(
  email: string,
  novaSenha: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("usuarios")
      .update({ senha: novaSenha })
      .eq("email", email.trim().toLowerCase());

    if (error) return false;
    return true;
  } catch {
    return false;
  }
}
