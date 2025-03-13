'use client';

import { useState } from 'react';

export default function CadastroUsuario() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        cpf: '',
        role: 'Paciente',
        crm: '',
        status: 'ativo',
    });
    const [message, setMessage] = useState('');

    // Função para obter o token CSRF
    const getCsrfToken = (): string | null => {
        return document.cookie
            .split('; ')
            .find((row) => row.startsWith('csrftoken='))
            ?.split('=')[1] || null;
    };

    // Função para validar o CPF
    const validateCPF = (cpf: string) => {
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return cpfRegex.test(cpf);
    };

    // Função para lidar com as mudanças nos campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Função para enviar os dados do formulário
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage('');

        // Validações
        if (!validateCPF(formData.cpf)) {
            setMessage('CPF inválido. O formato deve ser XXX.XXX.XXX-XX.');
            return;
        }

        if (formData.role === 'Medico' && formData.crm.trim() === '') {
            setMessage('CRM é obrigatório para médicos.');
            return;
        }

        try {
            const csrfToken = getCsrfToken(); // Obtém o token CSRF do cookie
            if (!csrfToken) {
                setMessage('Token CSRF não encontrado.');
                return;
            }

            const response = await fetch('http://localhost:8000/cadastrar_usuario/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken, // Envia o CSRF token no cabeçalho
                },
                body: JSON.stringify(formData),
                credentials: 'include', // Inclui os cookies na requisição
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Cadastro realizado com sucesso!');
            } else {
                setMessage(data.error || 'Erro ao realizar cadastro.');
            }
        } catch (error) {
            console.error('Erro:', error);
            setMessage('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="pt-20 bg-gray-50 min-h-screen flex justify-center items-center">
            <div className="container mx-auto px-4 py-8 max-w-md bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold text-center text-indigo-600">Cadastro de Usuário</h1>

                {message && (
                    <div
                        className={`mt-4 p-3 rounded text-center text-white ${
                            message.includes('Erro') ? 'bg-red-500' : 'bg-green-500'
                        }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6">
                    <div className="mb-4">
                        <label className="block text-gray-600">Tipo de Usuário</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Paciente">Paciente</option>
                            <option value="Medico">Médico</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600">E-mail</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600">Telefone (opcional)</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-600">CPF</label>
                        <input
                            type="text"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    {formData.role === 'Medico' && (
                        <div className="mb-4">
                            <label className="block text-gray-600">CRM</label>
                            <input
                                type="text"
                                name="crm"
                                value={formData.crm}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-600">Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700 transition"
                    >
                        Cadastrar
                    </button>
                </form>
            </div>
        </div>
    );
}
