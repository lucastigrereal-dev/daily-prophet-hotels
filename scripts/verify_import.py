#!/usr/bin/env python3
"""
Script para verificar a importacao de posts do CSV
Mostra estatisticas e validacoes dos dados importados
"""
import sys
from typing import Dict, List

try:
    from supabase import create_client
except ImportError:
    print("[ERRO] supabase nao esta instalado")
    print("   Execute: pip install supabase-py")
    sys.exit(1)

# Configuration
SUPABASE_URL = "https://damxbdkteskryonvgvpc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus"


def main():
    print("[INICIO] Verificando importacao de posts...\n")

    # Connect to Supabase
    print("[INFO] Conectando ao Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[OK] Conectado ao Supabase\n")
    except Exception as e:
        print(f"[ERRO] Erro ao conectar: {e}")
        sys.exit(1)

    # Get all posts from CSV
    try:
        response = supabase.table('ideas').select('*').eq('sourcefile', 'planilha_de_postagens_grok.csv').execute()
        posts = response.data

        if not posts:
            print("[AVISO] Nenhum post encontrado com sourcefile = 'planilha_de_postagens_grok.csv'")
            sys.exit(1)

    except Exception as e:
        print(f"[ERRO] Erro ao buscar posts: {e}")
        sys.exit(1)

    # Print summary
    print(f"[INFO] Total de posts importados: {len(posts)}\n")

    # Statistics by pillar
    print("[INFO] Distribuicao por Pillar:")
    pillars: Dict[str, int] = {}
    for post in posts:
        pillar = post.get('pillar', 'N/A')
        pillars[pillar] = pillars.get(pillar, 0) + 1

    for pillar, count in sorted(pillars.items()):
        percentage = (count / len(posts)) * 100
        print(f"  - {pillar}: {count} ({percentage:.1f}%)")

    # Data integrity check
    print("\n[INFO] Verificacao de integridade:\n")

    stats = {
        'titulo': 0,
        'resumo': 0,
        'headlines': 0,
        'ctas': 0,
        'scriptreels': 0,
        'scriptcarousel': 0,
        'captionseo': 0,
        'hacks': 0,
        'pillar': 0,
        'completo': 0,
    }

    for post in posts:
        if post.get('title'):
            stats['titulo'] += 1
        if post.get('summary'):
            stats['resumo'] += 1
        headlines = post.get('headlines', [])
        if headlines and len(headlines) > 0:
            stats['headlines'] += 1
        ctas = post.get('ctassuggested', [])
        if ctas and len(ctas) > 0:
            stats['ctas'] += 1
        if post.get('scriptreels'):
            stats['scriptreels'] += 1
        if post.get('scriptcarousel'):
            stats['scriptcarousel'] += 1
        if post.get('captionseo'):
            stats['captionseo'] += 1
        if post.get('hacks'):
            stats['hacks'] += 1
        if post.get('pillar'):
            stats['pillar'] += 1

        # Complete post check
        if (post.get('title') and post.get('summary') and
            post.get('headlines') and post.get('ctassuggested') and
            post.get('scriptreels') and post.get('scriptcarousel') and
            post.get('captionseo') and post.get('pillar')):
            stats['completo'] += 1

    for field, count in stats.items():
        percentage = (count / len(posts)) * 100
        status = "[OK]" if count == len(posts) else "[!]"
        print(f"  {status} {field}: {count}/{len(posts)} ({percentage:.1f}%)")

    # Sample posts
    print("\n[INFO] Ultimos 3 posts importados:\n")

    for i, post in enumerate(posts[-3:], 1):
        print(f"{i}. {post['title'][:70]}")
        print(f"   Pillar: {post.get('pillar', 'N/A')}")
        print(f"   Headlines: {len(post.get('headlines', []))} sugestoes")
        print(f"   CTAs: {len(post.get('ctassuggested', []))} sugestoes")
        print()

    # Final status
    if stats['completo'] == len(posts):
        print("[SUCESSO] Todos os posts estao completos e validos!")
    else:
        print(f"[AVISO] {len(posts) - stats['completo']} posts incompletos")

    print(f"\n[FINAL] Verificacao concluida. Total: {len(posts)} posts OK")


if __name__ == '__main__':
    main()
