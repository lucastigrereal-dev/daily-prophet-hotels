#!/usr/bin/env python3
"""Create test workflow data in Supabase"""

import json
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://damxbdkteskryonvgvpc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhbXhiZGt0ZXNrcnlvbnZndnBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4ODY2OTEsImV4cCI6MjA4MjQ2MjY5MX0.cU2B2Qcwzt5DiRxzeicw68_NWfa2oh1nO3E4e5TPDus"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Checklist templates
checklists = {
    "fase_1": {
        "roteiro-gravacao": {"status": "pendente", "observacao": "Preparar roteiro"},
        "selecao-musica": {"status": "pendente", "observacao": "Escolher musica"},
        "preparacao-cenario": {"status": "pendente", "observacao": "Montar cenario"},
    },
    "fase_2": {
        "edicao-reel": {"status": "pendente", "observacao": "Editar reel"},
        "adicionar-efeitos": {"status": "pendente", "observacao": "Adicionar efeitos"},
        "legenda-sync": {"status": "pendente", "observacao": "Sincronizar legendas"},
    },
    "fase_3": {
        "revisar-qualidade": {"status": "pendente", "observacao": "Revisar qualidade"},
        "testar-audio": {"status": "pendente", "observacao": "Testar audio"},
        "compatibilidade": {"status": "pendente", "observacao": "Verificar compatibilidade"},
    },
    "fase_4": {
        "agendar-publicacao": {"status": "pendente", "observacao": "Agendar na plataforma"},
        "preparar-descricao": {"status": "pendente", "observacao": "Preparar descricao"},
        "definir-hashtags": {"status": "pendente", "observacao": "Definir hashtags"},
    },
    "fase_5": {
        "monitorar-metricas": {"status": "pendente", "observacao": "Monitorar visualizacoes"},
        "engajamento": {"status": "pendente", "observacao": "Responder comentarios"},
        "otimizacao": {"status": "pendente", "observacao": "Otimizar baseado em dados"},
    },
}

def main():
    print("Creating test data...\n")

    # Test postpacks
    test_postpacks = [
        {
            "title": "Dicas de Produtividade",
            "objective": "Compartilhar tecnicas de produtividade",
            "format": "reel",
        },
        {
            "title": "Receita Rapida",
            "objective": "Ensinar receita facil",
            "format": "carrossel",
        },
        {
            "title": "Motivacao Diaria",
            "objective": "Inspirar seguidores",
            "format": "story",
        },
    ]

    postpack_ids = []

    # Create postpacks
    print("Creating postpacks...")
    for postpack in test_postpacks:
        try:
            response = supabase.table("postpacks").insert(postpack).execute()
            if response.data:
                postpack_id = response.data[0]["id"]
                postpack_ids.append(postpack_id)
                print(f"OK: {postpack['title']} ({postpack_id})")
        except Exception as e:
            print(f"ERROR creating {postpack['title']}: {e}")

    if not postpack_ids:
        print("No postpacks created. Aborting...")
        return

    # Create workflows
    print("\nCreating workflows...")
    statuses = ["composicao", "fase_1", "fase_2", "fase_3", "fase_4"]

    for i, postpack_id in enumerate(postpack_ids):
        status = statuses[i % len(statuses)]

        workflow_data = {
            "postpack_id": postpack_id,
            "status": status,
            "created_by": "test-user",
            "fase_1_status": "em_progresso" if status in ["fase_1", "fase_2", "fase_3", "fase_4", "fase_5"] else "pendente",
            "fase_1_checklist": checklists["fase_1"],
            "fase_2_status": "em_progresso" if status in ["fase_2", "fase_3", "fase_4", "fase_5"] else "pendente",
            "fase_2_checklist": checklists["fase_2"],
            "fase_3_status": "em_progresso" if status in ["fase_3", "fase_4", "fase_5"] else "pendente",
            "fase_3_checklist": checklists["fase_3"],
            "fase_4_status": "em_progresso" if status in ["fase_4", "fase_5"] else "pendente",
            "fase_4_checklist": checklists["fase_4"],
            "fase_5_status": "em_progresso" if status == "fase_5" else "pendente",
            "fase_5_checklist": checklists["fase_5"],
        }

        try:
            response = supabase.table("postpack_workflow").insert(workflow_data).execute()
            if response.data:
                workflow_id = response.data[0]["id"]
                print(f"OK: Workflow {workflow_id[:8]}... (status: {status})")
        except Exception as e:
            print(f"ERROR creating workflow: {e}")

    print("\nTest data created successfully!")
    print("\nNext steps:")
    print("   1. Open http://localhost:3000/workflow")
    print("   2. You should see the workflows listed")
    print("   3. Click on a workflow to see details")

if __name__ == "__main__":
    main()
