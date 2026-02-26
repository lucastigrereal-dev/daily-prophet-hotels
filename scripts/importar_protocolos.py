"""
Script para importar protocolos dos arquivos .md para Supabase
"""

import json
import requests
import re
from pathlib import Path

# Configuracao Supabase
SUPABASE_URL = "https://damxbdkteskryonvgvpc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njg4NjY5MSwiZXhwIjoyMDgyNDYyNjkxfQ.k_qJBtJ1nwOqxSJBx2rgk_FnZaD6-VI1ILKi-OPZZ6Q"

# Pasta com protocolos
PROTOCOLS_PATH = Path(r"C:\Users\lucas\Desktop\DailyProphet_total\CONTEUDO_GERAL_INSTITUTO\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO (3)\ARQUIVOS_SISTEMA_INSTAGRAM_INSTITUTO")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def parse_protocol_file(filepath):
    """Extrai informacoes do arquivo de protocolo"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = filepath.stem  # ex: protocolo-1-2-reels-alcance

    # Extrair numero do bloco e subnumero do nome
    match = re.search(r'protocolo-(\d+)-(\d+)', filename)
    if match:
        blocknumber = int(match.group(1))
        subnumber = int(match.group(2))
    else:
        blocknumber = 0
        subnumber = 0

    # Extrair titulo da linha 2 (## titulo)
    lines = content.split('\n')
    name = filename.replace('protocolo-', '').replace('-', ' ').title()

    for line in lines[:10]:
        if line.startswith('## ') and '-' in line:
            # Remove emojis e formata
            name = re.sub(r'^\#+\s*[\d\.]+\s*-?\s*', '', line)
            name = re.sub(r'\([^)]*\)', '', name).strip()
            name = name.replace('**', '').strip()
            break

    # Extrair objetivo (section 1)
    objetivo_match = re.search(r'\*\*Objetivo Primário:\*\*\s*([^\n]+)', content)
    description = objetivo_match.group(1).strip() if objetivo_match else ""

    # Extrair quando usar
    quando_match = re.search(r'## \d+\. QUANDO USAR(.*?)##', content, re.DOTALL)
    whentouse = ""
    if quando_match:
        whentouse_text = quando_match.group(1)
        # Pegar primeira linha relevante
        for line in whentouse_text.split('\n'):
            if line.strip().startswith('- **Objetivo:**'):
                whentouse = line.replace('- **Objetivo:**', '').strip()
                break

    # Determinar categoria do nome do arquivo
    category = "geral"
    if "reels" in filename.lower():
        category = "reels"
    elif "carrossel" in filename.lower():
        category = "carrossel"
    elif "stories" in filename.lower():
        category = "stories"
    elif "legenda" in filename.lower():
        category = "legendas"
    elif "estrategia" in filename.lower() or "kpi" in filename.lower():
        category = "estrategia"
    elif "community" in filename.lower() or "dm" in filename.lower() or "replies" in filename.lower():
        category = "engajamento"
    elif "monetiz" in filename.lower() or "produto" in filename.lower() or "afiliado" in filename.lower():
        category = "monetizacao"
    elif "crisis" in filename.lower() or "recovery" in filename.lower():
        category = "crise"
    elif "niche" in filename.lower() or "authority" in filename.lower():
        category = "posicionamento"
    elif "ads" in filename.lower() or "paid" in filename.lower():
        category = "trafego_pago"

    return {
        "code": filename,
        "name": name[:100] if len(name) > 100 else name,
        "blocknumber": blocknumber,
        "subnumber": subnumber,
        "category": category,
        "description": description[:500] if len(description) > 500 else description,
        "whentouse": whentouse[:255] if len(whentouse) > 255 else whentouse,
        "sourcefile": filepath.name,
        "isactive": True,
        "version": 1
    }

def main():
    print("=" * 50)
    print("IMPORTANDO PROTOCOLOS")
    print("=" * 50)

    # Encontrar arquivos de protocolo
    protocol_files = list(PROTOCOLS_PATH.glob("protocolo*.md"))
    print(f"\nEncontrados: {len(protocol_files)} arquivos de protocolo")

    # Verificar protocolos existentes
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/protocols?select=code",
        headers=HEADERS
    )
    existing_codes = [p['code'] for p in response.json()] if response.status_code == 200 else []
    print(f"Existentes no banco: {len(existing_codes)}")

    url = f"{SUPABASE_URL}/rest/v1/protocols"
    inseridos = 0
    atualizados = 0
    erros = 0

    for filepath in protocol_files:
        try:
            data = parse_protocol_file(filepath)

            if data['code'] in existing_codes:
                # Atualizar existente
                resp = requests.patch(
                    f"{url}?code=eq.{data['code']}",
                    headers=HEADERS,
                    json=data
                )
                if resp.status_code in [200, 204]:
                    atualizados += 1
                    print(f"  [UPDATE] {data['code']}: {data['name']}")
                else:
                    erros += 1
                    print(f"  [ERRO UPDATE] {data['code']}: {resp.status_code}")
            else:
                # Inserir novo
                resp = requests.post(url, headers=HEADERS, json=data)
                if resp.status_code in [200, 201]:
                    inseridos += 1
                    print(f"  [INSERT] {data['code']}: {data['name']}")
                else:
                    erros += 1
                    print(f"  [ERRO INSERT] {data['code']}: {resp.status_code} - {resp.text[:100]}")
        except Exception as e:
            erros += 1
            print(f"  [ERRO] {filepath.name}: {str(e)}")

    print("\n" + "=" * 50)
    print(f"RESULTADO:")
    print(f"  Inseridos: {inseridos}")
    print(f"  Atualizados: {atualizados}")
    print(f"  Erros: {erros}")
    print("=" * 50)

if __name__ == "__main__":
    main()
