'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function AreaDoUsuario() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Paciente');
  const [message, setMessage] = useState('');

  // Função para obter o token CSRF
  const getCsrfToken = (): string | null => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('csrftoken='))
      ?.split('=')[1] || null;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(''); // Limpa a mensagem de erro ou sucesso

    try {
      const csrfToken = getCsrfToken(); // Obtém o token CSRF do cookie
      if (!csrfToken) {
        setMessage('Token CSRF não encontrado.');
        return;
      }

      const response = await fetch('http://localhost:8000/login_usuario/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken, // Envia o CSRF token no cabeçalho
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Inclui os cookies na requisição
      });

      const data = await response.json();

      if (response.ok) {
        // Se o login for bem-sucedido
        setIsLoggedIn(true);
        setRole(data.role); // Supondo que o backend envie o 'role' do usuário
        setMessage('Login bem-sucedido!');
      } else {
        setMessage(data.error || 'Credenciais inválidas'); // Mensagem mais detalhada
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="pt-20 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-6">Área do Usuário</h1>

        {!isLoggedIn ? (
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label htmlFor="role" className="block text-sm font-medium text-gray-600">Tipo de Usuário</label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Paciente">Paciente</option>
                  <option value="Medico">Médico</option>
                </select>
              </div>
              <div className="mb-5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600">Senha</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white p-3 rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
              >
                Entrar
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Não tem uma conta?{' '}
              <Link href="/area-do-usuario/cadastro_usuario">
                <button className="text-indigo-600 hover:underline">Cadastre-se aqui</button>
              </Link>
            </p>
            {message && (
              <p className="mt-4 text-center text-sm text-red-500">{message}</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Minhas Consultas</h2>
                <p className="text-gray-500">Aqui você pode consultar seus agendamentos.</p>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Meu Perfil</h2>
                <p className="text-gray-500">Visualize e edite suas informações pessoais.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
