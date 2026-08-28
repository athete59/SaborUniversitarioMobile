import { supabase } from "./supabase";

export async function buscarUsuarioPorEmail(email: string) {
  try {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    return null;
  }
}

export async function atualizarSenha(
  email: string,
  novaSenha: string,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("usuarios")
      .update({ senha: novaSenha })
      .eq("email", email.trim().toLowerCase());

    if (error) return false;
    return true;
  } catch (err) {
    return false;
  }
}
