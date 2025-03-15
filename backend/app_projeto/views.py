from django.http import JsonResponse
import json
import re
import requests
from .models import Usuario
from django.contrib.auth.hashers import check_password
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from django.contrib.auth.models import User
from .utils import generate_jwt
from django.contrib.auth import authenticate, login
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer




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
        status = data.get('status', 'ativo')  # Definido como 'ativo' por padrão
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

        # Verifica se o email já está registrado
        if Usuario.objects.filter(email=email).exists():
            return JsonResponse({'error': 'Email já cadastrado.'}, status=400)

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

        # Gera o token JWT para o novo usuário
        token = generate_jwt(usuario)

        # Retorna uma resposta de sucesso com o token JWT
        return JsonResponse({'message': 'Cadastro realizado com sucesso!', 'token': token}, status=201)
    
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

        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return JsonResponse({'error': 'Usuário não encontrado'}, status=404)

        # Verifica se a senha está correta
        if check_password(password, usuario.senha):  
            # Gera o token JWT
            token = generate_jwt(usuario)

            return JsonResponse({
                'message': 'Login bem-sucedido!',
                'token': token
            })
        else:
            return JsonResponse({'error': 'Credenciais inválidas'}, status=401)

    return JsonResponse({'error': 'Método não permitido'}, status=405)

def rota_protegida(request):
    if hasattr(request, "user_data"):
        return JsonResponse({"message": "Acesso autorizado!", "user": request.user_data})
    
    return JsonResponse({"error": "Acesso não autorizado"}, status=401)

@csrf_exempt
def google_login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)
        token = data.get("token")

        # Validar o token com o Google
        google_response = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
        if google_response.status_code != 200:
            return JsonResponse({"error": "Token inválido"}, status=400)

        user_data = google_response.json()
        email = user_data.get("email")
        name = user_data.get("name")

        # Criar usuário se não existir
        user, created = User.objects.get_or_create(username=email, defaults={"email": email, "first_name": name})

        jwt_token = generate_jwt(user)
        return JsonResponse({"token": jwt_token})
    
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)  # Gera os tokens padrão
        user = self.user  # Obtém o usuário autenticado
        
        # Adiciona informações extras na resposta
        data.update({
            "user_id": user.id,
            "name": user.nome,  # Corrigido para "nome", se seu modelo `Usuario` usa esse campo
            "email": user.email,
            "role": user.role,  # Se tiver esse campo no seu modelo
        })
        return data

# Modifica a view para usar o novo serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
