"""
Script de importacao de dados para o Daily Prophet
Importa CTAs, Legendas, Hashtags, Keywords e Protocolos
"""

import json
import requests
import os
from pathlib import Path

# Configuracao Supabase
SUPABASE_URL = "https://damxbdkteskryonvgvpc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njg4NjY5MSwiZXhwIjoyMDgyNDYyNjkxfQ.k_qJBtJ1nwOqxSJBx2rgk_FnZaD6-VI1ILKi-OPZZ6Q"

# Pasta base dos JSONs
BASE_PATH = Path(r"C:\Users\lucas\Desktop\DailyProphet_total\CONTEUDO_GERAL_INSTITUTO\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO (3)\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO\output_daily_prophet")

# Headers para requisicoes
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

PROFILE_ID = "11111111-1111-1111-1111-111111111111"

def carregar_json(nome_arquivo):
    """Carrega um arquivo JSON"""
    caminho = BASE_PATH / nome_arquivo
    if caminho.exists():
        with open(caminho, 'r', encoding='utf-8') as f:
            return json.load(f)
    print(f"Arquivo nao encontrado: {caminho}")
    return []

def limpar_tabela(tabela):
    """Remove todos os registros de uma tabela"""
    url = f"{SUPABASE_URL}/rest/v1/{tabela}"
    # Delete all - usando um filtro que pega tudo
    response = requests.delete(f"{url}?id=neq.00000000-0000-0000-0000-000000000000", headers=HEADERS)
    if response.status_code in [200, 204]:
        print(f"Tabela {tabela} limpa com sucesso")
    else:
        print(f"Erro ao limpar {tabela}: {response.status_code} - {response.text}")

def parse_volume(vol_str):
    """Converte volume string (890k, 2.1M) para numero ou None"""
    if not vol_str or vol_str == "N/A":
        return None
    try:
        vol_str = str(vol_str).lower().replace(",", ".")
        if "m" in vol_str:
            return int(float(vol_str.replace("m", "")) * 1000000)
        elif "k" in vol_str:
            return int(float(vol_str.replace("k", "")) * 1000)
        else:
            return int(float(vol_str))
    except:
        return None

def inserir_components(dados, tipo):
    """Insere dados na tabela components"""
    url = f"{SUPABASE_URL}/rest/v1/components"
    inseridos = 0

    for item in dados:
        # Mapear campos conforme o tipo
        if tipo == "cta":
            registro = {
                "profileid": PROFILE_ID,
                "type": "cta",
                "category": item.get("categoria", "Geral"),
                "text": item.get("texto", ""),
                "format": item.get("formato", "").lower() if item.get("formato") else "reels",
                "pillar": item.get("pilar", ""),
                "notes": item.get("observacao", ""),
                "sourcefile": item.get("origem", ""),
                "status": "active",
                "risklevel": "baixo",
                "compliancestatus": "approved"
            }
        elif tipo == "legenda":
            registro = {
                "profileid": PROFILE_ID,
                "type": f"legenda_{item.get('tipo', 'geral')}",
                "category": item.get("gatilho", "Geral"),
                "text": item.get("texto", ""),
                "pillar": item.get("pilar", ""),
                "notes": item.get("keyword_principal", ""),
                "objective": item.get("procedimento", ""),
                "sourcefile": item.get("origem", ""),
                "status": "active",
                "risklevel": "baixo",
                "compliancestatus": "approved"
            }
        elif tipo == "hashtag":
            registro = {
                "profileid": PROFILE_ID,
                "type": "hashtag",
                "category": item.get("nivel", "broad"),
                "text": item.get("tag", "").replace("#", ""),
                "volume": parse_volume(item.get("volume")),
                "intent": item.get("intencao", ""),
                "risklevel": item.get("risco_compliance", "baixo"),
                "notes": item.get("justificativa", ""),
                "objective": item.get("tema", ""),
                "sourcefile": item.get("origem", ""),
                "status": "active",
                "compliancestatus": "approved"
            }
        elif tipo == "keyword":
            registro = {
                "profileid": PROFILE_ID,
                "type": "keyword",
                "category": item.get("categoria", "Geral"),
                "text": item.get("keyword", ""),
                "volume": parse_volume(item.get("volume_mensal")),
                "intent": item.get("intencao", ""),
                "notes": f"CPC: {item.get('cpc', 'N/A')} | Dificuldade: {item.get('dificuldade', 'N/A')}",
                "objective": item.get("tipo_busca", ""),
                "sourcefile": item.get("origem", ""),
                "status": "active",
                "risklevel": "baixo",
                "compliancestatus": "approved"
            }
        else:
            continue

        # Inserir
        response = requests.post(url, headers=HEADERS, json=registro)
        if response.status_code in [200, 201]:
            inseridos += 1
        else:
            print(f"Erro ao inserir {tipo}: {response.status_code}")

    return inseridos

def importar_ctas():
    """Importa CTAs do JSON"""
    print("\n=== IMPORTANDO CTAs ===")
    dados = carregar_json("ctas.json")
    if dados:
        inseridos = inserir_components(dados, "cta")
        print(f"CTAs importados: {inseridos}/{len(dados)}")
    return len(dados) if dados else 0

def importar_legendas():
    """Importa Legendas do JSON"""
    print("\n=== IMPORTANDO LEGENDAS ===")
    dados = carregar_json("legendas.json")
    if dados:
        inseridos = inserir_components(dados, "legenda")
        print(f"Legendas importadas: {inseridos}/{len(dados)}")
    return len(dados) if dados else 0

def importar_hashtags():
    """Importa Hashtags do JSON"""
    print("\n=== IMPORTANDO HASHTAGS ===")
    dados = carregar_json("hashtags.json")
    if dados:
        inseridos = inserir_components(dados, "hashtag")
        print(f"Hashtags importadas: {inseridos}/{len(dados)}")
    return len(dados) if dados else 0

def importar_keywords():
    """Importa Keywords do JSON"""
    print("\n=== IMPORTANDO KEYWORDS ===")
    dados = carregar_json("keywords.json")
    if dados:
        inseridos = inserir_components(dados, "keyword")
        print(f"Keywords importadas: {inseridos}/{len(dados)}")
    return len(dados) if dados else 0

def contar_registros():
    """Conta registros por tipo na tabela components"""
    url = f"{SUPABASE_URL}/rest/v1/components?select=type"
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        dados = response.json()
        contagem = {}
        for item in dados:
            tipo = item.get('type', 'unknown')
            contagem[tipo] = contagem.get(tipo, 0) + 1
        return contagem
    return {}

def main():
    print("=" * 50)
    print("DAILY PROPHET - IMPORTACAO DE DADOS")
    print("=" * 50)

    # Contar antes
    print("\n>>> ANTES DA IMPORTACAO:")
    contagem_antes = contar_registros()
    for tipo, qtd in contagem_antes.items():
        print(f"  {tipo}: {qtd}")
    print(f"  TOTAL: {sum(contagem_antes.values())}")

    # Importar
    total_ctas = importar_ctas()
    total_legendas = importar_legendas()
    total_hashtags = importar_hashtags()
    total_keywords = importar_keywords()

    # Contar depois
    print("\n>>> DEPOIS DA IMPORTACAO:")
    contagem_depois = contar_registros()
    for tipo, qtd in sorted(contagem_depois.items()):
        print(f"  {tipo}: {qtd}")
    print(f"  TOTAL: {sum(contagem_depois.values())}")

    print("\n" + "=" * 50)
    print("IMPORTACAO CONCLUIDA!")
    print("=" * 50)

if __name__ == "__main__":
    main()
