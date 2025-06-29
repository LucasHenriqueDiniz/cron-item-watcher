#!/bin/bash

echo "====================================================="
echo "      Inicialização do Cron Item Watcher Server      "
echo "====================================================="

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js para continuar."
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"

# Instalar dependências
echo -e "\nInstalando dependências..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências. Verifique os erros acima."
    exit 1
fi
echo "✅ Dependências instaladas com sucesso."

# Verificar se o arquivo .env existe, se não, criar a partir do .env.example
if [ ! -f .env ]; then
    echo -e "\nArquivo .env não encontrado. Criando a partir de .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado. Por favor, edite-o com suas configurações antes de continuar."
        echo "   Especialmente defina o DISCORD_WEBHOOK_URL e os STEAM_BOT_IDS."
    else
        echo "❌ Arquivo .env.example não encontrado. Crie um arquivo .env manualmente."
    fi
else
    echo "✅ Arquivo .env já existe."
fi

# Criar diretório de dados
mkdir -p data

# Compilar o código
echo -e "\nCompilando o código TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar o código. Verifique os erros acima."
    exit 1
fi
echo "✅ Código compilado com sucesso."

# Inicializar o banco de dados
echo -e "\nInicializando o banco de dados..."
npm run init:db
if [ $? -ne 0 ]; then
    echo "❌ Erro ao inicializar o banco de dados. Verifique os erros acima."
    exit 1
fi
echo "✅ Banco de dados inicializado com sucesso."

# Verificar o estado do banco de dados
echo -e "\nVerificando o estado do banco de dados..."
npm run check:db

echo -e "\n====================================================="
echo "     Inicialização concluída com sucesso!            "
echo "=====================================================\n"
echo "Para iniciar o servidor em modo de desenvolvimento:"
echo "npm run dev:server"
echo ""
echo "Para iniciar o servidor em produção:"
echo "npm run start:server"
echo ""
echo "Para executar uma verificação única de itens:"
echo "npm run dev"
echo ""
echo "Para verificar o estado do banco de dados:"
echo "npm run check:db"
echo "====================================================="
