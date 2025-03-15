'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';  // Para navegação após login
import Link from 'next/link'; 

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const [userName, setUserName] = useState('');
    const router = useRouter(); // Instancia o router

    const getCsrfToken = (): string | null => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1] || null;
    };

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        try {
            const csrfToken = getCsrfToken();  // Obtém o token CSRF
            if (!csrfToken) {
                setMessage('Token CSRF não encontrado.');
                return;
            }

            const response = await fetch('http://localhost:8000/login_usuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,  // Envia o token CSRF
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok) {
                setIsLoggedIn(true);
                setRole(data.role);
                setUserName(data.nome || email);  // Usa nome ou e-mail caso nome não esteja disponível

                // Armazenar informações de login no localStorage
                localStorage.setItem('auth_token', data.token);  // Armazena o token no localStorage
                
                setMessage('Login bem-sucedido!');
                router.push('/area-do-usuario');  // Redireciona para a área do usuário
            } else {
                setMessage(data.error || 'Credenciais inválidas');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage('Erro ao conectar com o servidor');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>
            <form onSubmit={handleLogin}>
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
                <Link href="cadastro_usuario">
                    Cadastre-se aqui
                </Link>
            </p>
            {message && (
                <p className="mt-4 text-center text-sm text-red-500">{message}</p>
            )}
        </div>
    );
}
