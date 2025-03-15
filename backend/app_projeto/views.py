from django.http import JsonResponse
import json
from .models import Usuario
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@csrf_exempt
def cadastrar_usuario(request):
    if request.method == 'POST':
        try:
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

        # Valida o CRM para psiquiatras
        if role == 'Psiquiatra' and not data.get('crm'):
            return JsonResponse({'error': 'O CRM é obrigatório para psiquiatras.'}, status=400)
        
        # Valida o CRP para psicólogos
        if role == 'Psicologo' and not data.get('crp'):
            return JsonResponse({'error': 'O CRP é obrigatório para psicólogos.'}, status=400)

        # Criptografa a senha
        senha_criptografada = make_password(senha)

        # Criação do usuário no banco de dados
        usuario = Usuario(
            nome=nome,
            email=email,
            telefone=telefone,
            cpf=cpf,
            senha=senha_criptografada,
            status=status,
            role=role,  # Adiciona o campo role corretamente
            crm=data.get('crm') if role == 'Psiquiatra' else None,  # Atribui o CRM somente se for psiquiatra
            crp=data.get('crp') if role == 'Psicologo' else None,  # Atribui o CRP somente se for psicólogo
        )

        # Salva o usuário no banco de dados
        usuario.save()

        # Retorna uma resposta de sucesso
        return JsonResponse({'message': 'Cadastro realizado com sucesso!'}, status=201)
    
    # Retorna erro para métodos não permitidos
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def login_usuario(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados inválidos'}, status=400)

        email = data.get('email')
        password = data.get('password')

        # Busca o usuário no modelo Usuario com base no email
        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

        # Verifica se a senha está correta
        if check_password(password, usuario.senha):  # Verifica a senha criptografada
    
            if usuario.role == 'Psiquiatra' and not usuario.crm:
                return JsonResponse({'error': 'CRM obrigatório para psiquiatras'}, status=400)
            if usuario.role == 'Psicologo' and not usuario.crp:
                return JsonResponse({'error': 'CRP obrigatório para psicólogos'}, status=400)

            # Se tudo estiver correto, retornar os dados do usuário
            return JsonResponse({
                'message': 'Login bem-sucedido!',

            })
        else:
            return JsonResponse({'error': 'Credenciais inválidas'}, status=401)

    return JsonResponse({'error': 'Método não permitido'}, status=405)
