#!/usr/bin/env python3
"""
Script para importar 60 posts do CSV diretamente para o Supabase
"""
import csv
import sys
import json
from pathlib import Path
from typing import List, Dict, Any

# Try to import supabase
try:
    from supabase import create_client
except ImportError:
    print("❌ Erro: supabase não está instalado")
    print("   Execute: pip install supabase")
    sys.exit(1)

# Configuration
SUPABASE_URL = "https://damxbdkteskryonvgvpc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus"

CSV_PATH = r"C:\Users\lucas\Desktop\03_BACKUP\Downloads_COMET\planilha de postagens grok - Página1.csv"


def map_tipo_post_to_objective(tipo_post: str) -> str:
    """Mapear 'Tipo de Post' para objetivo"""
    tipo = tipo_post.lower().strip()
    # Todos mapeados para 'autoridade' conforme constraint da tabela
    return 'autoridade'


def infer_pillar_from_content(conteudo: str) -> str:
    """Inferir pillar do conteúdo"""
    content = conteudo.lower()

    if 'íntima' in content or 'intima' in content:
        return 'intimax'
    if 'face' in content or 'facial' in content or 'full face' in content:
        return 'fullface'
    if 'glúteo' in content or 'gluteo' in content or 'bumbum' in content:
        return 'gluteos'
    if 'seios' in content or 'mama' in content or 'busto' in content:
        return 'seios'
    if 'perna' in content or 'celulite' in content:
        return 'pernas'
    if 'barriga' in content or 'abdomen' in content:
        return 'abdomen'

    return 'geral'


def split_field(field: str, max_items: int = 5) -> List[str]:
    """Dividir campo por ';'"""
    if not field:
        return []
    items = field.split(';')
    return [item.strip().strip('"').strip("'") for item in items if item.strip()][:max_items]


def process_csv_row(row: Dict[str, str]) -> Dict[str, Any]:
    """Processar linha do CSV"""
    headlines = split_field(row.get('Headline (5 Sugestões)', ''), 5)
    ctas = split_field(row.get('CTA (5 Sugestões)', ''), 5)

    return {
        'title': headlines[0] if headlines else row.get('Conteudo (Resumo)', '')[:100],
        'summary': row.get('Conteudo (Resumo)', ''),
        'objective': map_tipo_post_to_objective(row.get('Tipo de Post', '')),
        'pillar': infer_pillar_from_content(row.get('Conteudo (Resumo)', '')),
        'headlines': headlines,
        'scriptreels': row.get('Roteiro Reels', ''),
        'scriptcarousel': row.get('Roteiro Carrossel', ''),
        'captionseo': row.get('Legenda SEO Evergreen', ''),
        'ctassuggested': ctas,
        'hacks': row.get('Hacks', ''),
        'sourcefile': 'planilha_de_postagens_grok.csv',
        'status': 'active',
    }


def main():
    print("[INICIO] Iniciando importacao de posts do CSV...\n")

    # Check if file exists
    if not Path(CSV_PATH).exists():
        print(f"[ERRO] Arquivo nao encontrado: {CSV_PATH}")
        sys.exit(1)

    print(f"[INFO] Encontrado CSV: {CSV_PATH}\n")

    # Read CSV
    posts_data = []
    try:
        with open(CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader, 1):
                post = process_csv_row(row)
                posts_data.append(post)

                if i <= 3:
                    print(f"[OK] Post {i}: {post['objective']} - {post['summary'][:50]}...")

        print(f"\n[INFO] Total de posts lidos: {len(posts_data)}\n")
    except Exception as e:
        print(f"[ERRO] Erro ao ler CSV: {e}")
        sys.exit(1)

    # Connect to Supabase
    print("[INFO] Conectando ao Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[OK] Conectado ao Supabase\n")
    except Exception as e:
        print(f"[ERRO] Erro ao conectar: {e}")
        sys.exit(1)

    # Insert data
    print("[INFO] Enviando posts para Supabase...\n")

    try:
        # Insert in batches of 10
        batch_size = 10
        total_inserted = 0

        for i in range(0, len(posts_data), batch_size):
            batch = posts_data[i:i+batch_size]

            response = supabase.table('ideas').insert(batch).execute()

            inserted = len(response.data) if response.data else 0
            total_inserted += inserted

            print(f"[OK] Lote {i//batch_size + 1}: {inserted} posts importados")

        print(f"\n[SUCESSO] Importacao realizada!")
        print(f"[INFO] Total importado: {total_inserted} posts")
        print(f"[FINAL] Importacao completa!")

    except Exception as e:
        print(f"[ERRO] Erro ao inserir: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
