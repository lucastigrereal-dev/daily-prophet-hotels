import { createClient } from "@/lib/supabase/server";

/**
 * Builds a rich AI context from hotel data + knowledge base
 * Used by both generate-post and generate-calendar routes
 */
export async function buildHotelContext(hotelId: string) {
  const supabase = await createClient();

  const [hotel, estruturas, digital, publico, posicionamento, metas] = await Promise.all([
    supabase.from("hotels").select("*").eq("id", hotelId).single(),
    supabase.from("hotel_estruturas").select("*").eq("hotel_id", hotelId).single(),
    supabase.from("hotel_digital").select("*").eq("hotel_id", hotelId).single(),
    supabase.from("hotel_publico").select("*").eq("hotel_id", hotelId).single(),
    supabase.from("hotel_posicionamento").select("*").eq("hotel_id", hotelId).single(),
    supabase.from("hotel_metas").select("*").eq("hotel_id", hotelId).single(),
  ]);

  if (!hotel.data) return null;

  const h = hotel.data;
  const est = estruturas.data;
  const dig = digital.data;
  const pub = publico.data;
  const pos = posicionamento.data;
  const met = metas.data;

  // Extract active structures
  const activeStructures = est
    ? Object.entries(est)
        .filter(([k, v]) => k.startsWith("tem_") && v === true)
        .map(([k]) => k.replace("tem_", "").replace(/_/g, " "))
    : [];

  // Extract audience
  const audiences: string[] = [];
  if (pub?.familias_criancas_0_6 || pub?.familias_criancas_7_12) audiences.push("Famílias com crianças");
  if (pub?.casais_jovens || pub?.casais_lua_mel) audiences.push("Casais");
  if (pub?.grupos_amigos) audiences.push("Grupos de amigos");
  if (pub?.viajantes_solo) audiences.push("Viajantes solo");
  if (pub?.executivos_negocios) audiences.push("Executivos");

  // Build positioning
  const positionings: string[] = [];
  if (pos?.posicionamento_luxuoso) positionings.push("luxuoso");
  if (pos?.posicionamento_custo_beneficio) positionings.push("custo-benefício");
  if (pos?.posicionamento_familia) positionings.push("familiar");
  if (pos?.posicionamento_romantico) positionings.push("romântico");
  if (pos?.posicionamento_aventureiro) positionings.push("aventureiro");
  if (pos?.posicionamento_aconchegante) positionings.push("aconchegante");

  return {
    raw: { hotel: h, estruturas: est, digital: dig, publico: pub, posicionamento: pos, metas: met },
    prompt: `HOTEL: ${h.nome}
Tipo: ${h.tipo} | ${h.cidade}/${h.estado}
${h.classificacao ? `Classificação: ${"⭐".repeat(h.classificacao)}` : ""}
${h.numero_quartos ? `Quartos: ${h.numero_quartos}` : ""}
${h.ticket_medio_diaria ? `Diária média: R$ ${h.ticket_medio_diaria}` : ""}

ESTRUTURA: ${activeStructures.length > 0 ? activeStructures.join(", ") : "não informado"}

PÚBLICO: ${audiences.length > 0 ? audiences.join(", ") : "misto"}

POSICIONAMENTO: ${positionings.length > 0 ? positionings.join(", ") : "não definido"}
${pos?.momento_uau ? `Momento UAU: ${pos.momento_uau}` : ""}
${pos?.prato_estrela ? `Prato estrela: ${pos.prato_estrela}` : ""}
${pos?.concorrente_direto ? `Concorrente: ${pos.concorrente_direto}` : ""}

INSTAGRAM: ${dig?.instagram_handle || "não informado"} (${dig?.instagram_seguidores || 0} seguidores)
${dig?.instagram_engajamento_medio ? `Engajamento: ${dig.instagram_engajamento_medio}%` : ""}

META: ${met?.meta_principal || "não definida"}
${met?.principal_dor_hoje ? `Dor: ${met.principal_dor_hoje}` : ""}`,
  };
}

/**
 * Fetches random hooks filtered by criteria to use as inspiration in AI prompts
 */
export async function getInspirationalHooks(
  publico?: string,
  tema?: string,
  limit = 5
) {
  const supabase = await createClient();

  let query = supabase.from("hooks").select("hook, intencao, tema");
  if (publico) query = query.eq("publico", publico);
  if (tema) query = query.eq("tema", tema);
  query = query.limit(limit);

  const { data } = await query;
  return data || [];
}

/**
 * Fetches benchmark posts similar to the request to use as reference
 */
export async function getBenchmarkReference(
  formato?: string,
  tema?: string,
  limit = 3
) {
  const supabase = await createClient();

  let query = supabase
    .from("benchmarks_posts")
    .select("hook, legenda_completa, cta, formato, tema")
    .eq("ativo", true);

  if (formato) query = query.eq("formato", formato);
  if (tema) query = query.eq("tema", tema);
  query = query.limit(limit);

  const { data } = await query;
  return data || [];
}

/**
 * Maps hotel type to content pillars with percentages
 */
export function getContentPillars(hotelType: string) {
  const pillars: Record<string, { pilar: string; pct: number; desc: string }[]> = {
    resort: [
      { pilar: "Família/Diversão", pct: 35, desc: "Piscina, kids club, recreação" },
      { pilar: "Gastronomia", pct: 25, desc: "All-inclusive, buffet, drinks" },
      { pilar: "Estrutura", pct: 20, desc: "Quartos, áreas, conforto" },
      { pilar: "Promo/Conversão", pct: 10, desc: "Pacotes, ofertas" },
      { pilar: "Social Proof", pct: 10, desc: "Reviews, UGC" },
    ],
    pousada: [
      { pilar: "Estética/Design", pct: 35, desc: "Detalhes, decoração, luz" },
      { pilar: "Experiência Sensorial", pct: 25, desc: "Calma, exclusividade" },
      { pilar: "Gastronomia Autoral", pct: 20, desc: "Pratos, drinks, chef" },
      { pilar: "Romance", pct: 15, desc: "Momentos a dois" },
      { pilar: "Destino", pct: 5, desc: "Entorno, comunidade" },
    ],
    boutique: [
      { pilar: "Estética/Design", pct: 35, desc: "Detalhes, decoração, luz" },
      { pilar: "Experiência Sensorial", pct: 25, desc: "Calma, exclusividade" },
      { pilar: "Gastronomia Autoral", pct: 20, desc: "Pratos, drinks, chef" },
      { pilar: "Romance", pct: 15, desc: "Momentos a dois" },
      { pilar: "Destino", pct: 5, desc: "Entorno, comunidade" },
    ],
    fazenda: [
      { pilar: "Natureza/Campo", pct: 35, desc: "Trilhas, animais, paisagem" },
      { pilar: "Família/Kids", pct: 25, desc: "Experiências, aprendizado" },
      { pilar: "Gastronomia Regional", pct: 20, desc: "Horta, comida caseira" },
      { pilar: "Sustentabilidade", pct: 10, desc: "Práticas eco" },
      { pilar: "Desconexão", pct: 10, desc: "Silêncio, estrelas, fogueira" },
    ],
    eco_resort: [
      { pilar: "Natureza/Campo", pct: 35, desc: "Trilhas, animais, paisagem" },
      { pilar: "Família/Kids", pct: 25, desc: "Experiências, aprendizado" },
      { pilar: "Gastronomia Regional", pct: 20, desc: "Horta, comida caseira" },
      { pilar: "Sustentabilidade", pct: 10, desc: "Práticas eco" },
      { pilar: "Desconexão", pct: 10, desc: "Silêncio, estrelas, fogueira" },
    ],
  };

  return pillars[hotelType] || [
    { pilar: "Estrutura", pct: 25, desc: "Piscina, quarto, áreas" },
    { pilar: "Gastronomia", pct: 20, desc: "Café, restaurante, bar" },
    { pilar: "Experiências", pct: 15, desc: "Atividades, passeios" },
    { pilar: "UGC", pct: 12, desc: "Fotos de hóspedes" },
    { pilar: "Promoções", pct: 10, desc: "Pacotes, ofertas" },
    { pilar: "Bastidores", pct: 8, desc: "Equipe, preparação" },
    { pilar: "Destino", pct: 5, desc: "Localização, cidade" },
    { pilar: "Sazonal", pct: 5, desc: "Datas comemorativas" },
  ];
}
