import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);

  const Perfis = [
    {
      id: 1,
      idPerfil: 'cliente',
      nome: 'Agatha Junqueira',
      email: 'agatha21@gmail.com',
      senha: 'gatinha123',
      quantficha: 5,
      foto: 'https://images.pexels.com/photos/15254860/pexels-photo-15254860.jpeg',
    },
    {
      id: 2,
      idPerfil: 'empresa',
      nome: 'Restaurante Universitário',
      email: 'ru@unifei.edu.br',
      senha: 'betinho59',
      foto: 'https://international.unifei.edu.br/wp-content/uploads/2022/02/unifei-itabira.jpg',
    },
    {
      id: 3,
      idPerfil: 'empresa',
      nome: 'Cantina da Maria',
      email: 'gabiroba2009@gmail.com',
      senha: 'dadinho53',
      foto: 'https://static.wixstatic.com/media/ce3e5c_fc0ac53c0e074c609e64aa7574ac28f4~mv2.png',
    },
  ];

  function fazendoLogin() {
    const usuario = Perfis.find(
      (user) => user.email === email.trim() && user.senha === senha
    );

    if (!usuario) {
      setErro('* Ocorreu um erro ao preencher o email/senha. Tente novamente');
      return;
    }

    setErro(null);
    Alert.alert('Sucesso', `Bem-vindo(a), ${usuario.nome}!`);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.head}>
        <Text style={styles.headerTitle}>Sabor Universitário</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Acesse a sua conta</Text>
          <Text style={styles.subtitle}>Entre com o seu email e a sua senha</Text>

          {erro && <Text style={styles.alerta}>{erro}</Text>}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          <TouchableOpacity style={styles.entrarButton} onPress={fazendoLogin}>
            <Text style={styles.entrarButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert('Aviso', 'Ir para recuperação de senha')}
          >
            <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Ao clicar em Entrar, você concorda com os termos de serviço e de uso.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FF7124',
  },
  head: {
    backgroundColor: '#FF7124',
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FF9C72',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  alerta: {
    color: '#EA0505',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    color: '#000',
  },
  entrarButton: {
    backgroundColor: '#FF7124',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  entrarButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#000000',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 18,
  },
  terms: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
  },
});