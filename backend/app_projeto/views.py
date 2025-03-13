from django.http import JsonResponse
import json
from .models import Usuario
from django.contrib.auth.hashers import make_password
import re
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate


def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@csrf_exempt
def cadastrar_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos'}, status=400)

        # Processamento dos dados...
        return JsonResponse({'message': 'Cadastro realizado com sucesso!'}, status=201)

    return JsonResponse({'error': 'Método não permitido'}, status=405)

# Remova o @csrf_exempt
# @csrf_exempt
def cadastrar_usuario(request):
    if request.method == 'POST':
        try:
            # Tenta carregar os dados JSON do corpo da requisição
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos'}, status=400)

        # Coleta os dados do corpo da requisição
        nome = data.get('name')
        email = data.get('email')
        telefone = data.get('phone', '')
        cpf = data.get('cpf')
        senha = data.get('password')
        status = data.get('status', 'ativo')
        role = data.get('role')

        # Valida o CPF
        cpf_regex = r'^\d{3}\.\d{3}\.\d{3}-\d{2}$'
        if not re.match(cpf_regex, cpf):
            return JsonResponse({'error': 'CPF inválido. O formato deve ser XXX.XXX.XXX-XX.'}, status=400)

        # Valida o CRM para médicos
        if role == 'Medico' and not data.get('crm'):
            return JsonResponse({'error': 'CRM é obrigatório para médicos.'}, status=400)

        # Criptografa a senha
        senha_criptografada = make_password(senha)

        # Criação do usuário no banco de dados
        usuario = Usuario(
            nome=nome,
            email=email,
            telefone=telefone,
            cpf=cpf,
            senha=senha_criptografada,
            status=status
        )

        # Salva o usuário no banco de dados
        usuario.save()

        # Retorna uma resposta de sucesso
        return JsonResponse({'message': 'Cadastro realizado com sucesso!'}, status=201)
    
    # Retorna erro para métodos não permitidos
    return JsonResponse({'error': 'Método não permitido'}, status=405)


def login_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos'}, status=400)

        email = data.get('email')
        password = data.get('password')

        # Tenta autenticar o usuário usando o email e a senha
        user = authenticate(request, username=email, password=password)

        if user is not None:
            # Sucesso no login
            # Envia a resposta com o role do usuário
            return JsonResponse({'message': 'Login bem-sucedido', 'role': user.role}, status=200)
        else:
            # Credenciais inválidas
            return JsonResponse({'error': 'Credenciais inválidas'}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)