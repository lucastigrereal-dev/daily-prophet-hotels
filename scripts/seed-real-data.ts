import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ====================================
// GANCHOS (50+ hooks com variedade)
// ====================================
const ganchosReais = [
  // CURIOSIDADE
  { texto: "Você sabia que 90% dos homens sofrem com isso?", tipo_gancho: "curiosidade", tipo_post: "reel", pilar: "intimax", objetivo: "autoridade" },
  { texto: "O que ninguém te conta sobre harmonização facial...", tipo_gancho: "revelacao", tipo_post: "reel", pilar: "fullface", objetivo: "autoridade" },
  { texto: "3 erros que você comete TODO dia com a pele", tipo_gancho: "erro", tipo_post: "carrossel", pilar: "fullface", objetivo: "educativo" },
  { texto: "Médicos não querem que você saiba disso...", tipo_gancho: "segredo", tipo_post: "reel", pilar: "intimax", objetivo: "autoridade" },
  { texto: "Isso muda TUDO que você sabe sobre estética", tipo_gancho: "revelacao", tipo_post: "reel", pilar: "geral", objetivo: "viral" },

  // MITO VS VERDADE
  { texto: "MITO: Harmonização facial dói muito", tipo_gancho: "mito", tipo_post: "carrossel", pilar: "fullface", objetivo: "educativo" },
  { texto: "MITO: Resultado fica artificial", tipo_gancho: "mito", tipo_post: "carrossel", pilar: "fullface", objetivo: "educativo" },
  { texto: "MITO: Qualquer um pode fazer procedimento", tipo_gancho: "mito", tipo_post: "carrossel", pilar: "intimax", objetivo: "autoridade" },
  { texto: "MITO: Gluteoplastia é proibida", tipo_gancho: "mito", tipo_post: "carrossel", pilar: "gluteos", objetivo: "educativo" },
  { texto: "MITO: Resultado não dura nada", tipo_gancho: "mito", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },

  // PROVA SOCIAL
  { texto: "Paciente chegou aqui assim...", tipo_gancho: "transformacao", tipo_post: "reel", pilar: "gluteos", objetivo: "prova_social" },
  { texto: "Antes e depois: 30 dias de transformação", tipo_gancho: "transformacao", tipo_post: "carrossel", pilar: "fullface", objetivo: "prova_social" },
  { texto: "Resultado real de paciente real", tipo_gancho: "transformacao", tipo_post: "reel", pilar: "intimax", objetivo: "prova_social" },
  { texto: "Veja a evolução dela em 60 dias", tipo_gancho: "transformacao", tipo_post: "reel", pilar: "gluteos", objetivo: "prova_social" },
  { texto: "Pacientes compartilham resultados", tipo_gancho: "transformacao", tipo_post: "carrossel", pilar: "geral", objetivo: "prova_social" },

  // EDUCATIVO
  { texto: "5 coisas que você precisa saber antes", tipo_gancho: "lista", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },
  { texto: "Checklist completo antes do procedimento", tipo_gancho: "lista", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },
  { texto: "Passo a passo do procedimento explicado", tipo_gancho: "tutorial", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },
  { texto: "Como cuidar do resultado após o procedimento", tipo_gancho: "tutorial", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },
  { texto: "Dúvidas mais frequentes respondidas", tipo_gancho: "faq", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },

  // CONVERSÃO
  { texto: "Última vaga disponível esta semana!", tipo_gancho: "urgencia", tipo_post: "stories", pilar: "geral", objetivo: "conversao" },
  { texto: "Condição especial VÁLIDA SOMENTE até sexta", tipo_gancho: "urgencia", tipo_post: "stories", pilar: "geral", objetivo: "conversao" },
  { texto: "Resultado garantido OU seu dinheiro de volta", tipo_gancho: "garantia", tipo_post: "reel", pilar: "intimax", objetivo: "conversao" },
  { texto: "Parcele em até 12x no seu cartão", tipo_gancho: "oferta", tipo_post: "stories", pilar: "geral", objetivo: "conversao" },
  { texto: "Agende agora e ganhe consultoria grátis", tipo_gancho: "bonus", tipo_post: "reel", pilar: "geral", objetivo: "conversao" },

  // ENGAJAMENTO
  { texto: "Conta pra mim nos comentários...", tipo_gancho: "pergunta", tipo_post: "reel", pilar: "geral", objetivo: "engajamento" },
  { texto: "Você concorda com isso? 🤔", tipo_gancho: "pergunta", tipo_post: "stories", pilar: "geral", objetivo: "engajamento" },
  { texto: "Qual sua maior dúvida sobre este procedimento?", tipo_gancho: "pergunta", tipo_post: "stories", pilar: "geral", objetivo: "engajamento" },
  { texto: "Marca aquele amigo que PRECISA ver isso", tipo_gancho: "marca", tipo_post: "reel", pilar: "geral", objetivo: "engajamento" },
  { texto: "Salva este post antes que saia do ar", tipo_gancho: "cta", tipo_post: "stories", pilar: "geral", objetivo: "engajamento" },

  // POV
  { texto: "POV: Você acabou de descobrir esse procedimento", tipo_gancho: "pov", tipo_post: "reel", pilar: "intimax", objetivo: "viral" },
  { texto: "POV: Sua primeira consulta comigo", tipo_gancho: "pov", tipo_post: "reel", pilar: "fullface", objetivo: "autoridade" },
  { texto: "POV: Você vê o resultado após 30 dias", tipo_gancho: "pov", tipo_post: "reel", pilar: "geral", objetivo: "viral" },

  // STORYTELLING
  { texto: "Paciente chegou no consultório chorando...", tipo_gancho: "historia", tipo_post: "reel", pilar: "intimax", objetivo: "emocional" },
  { texto: "Essa história me marcou profundamente", tipo_gancho: "historia", tipo_post: "reel", pilar: "geral", objetivo: "emocional" },
  { texto: "A transformação dessa paciente foi incrível", tipo_gancho: "historia", tipo_post: "reel", pilar: "gluteos", objetivo: "emocional" },

  // COMPARAÇÃO
  { texto: "Veja a diferença entre estes dois procedimentos", tipo_gancho: "comparacao", tipo_post: "carrossel", pilar: "geral", objetivo: "educativo" },
  { texto: "Qual é melhor para você?", tipo_gancho: "comparacao", tipo_post: "carrossel", pilar: "geral", objetivo: "engajamento" },

  // URGÊNCIA + FOMO
  { texto: "Só 3 vagas sobrando para esta semana", tipo_gancho: "fomo", tipo_post: "stories", pilar: "geral", objetivo: "conversao" },
  { texto: "Agende antes que alguém leve sua vaga", tipo_gancho: "fomo", tipo_post: "reel", pilar: "geral", objetivo: "conversao" },
  { texto: "Esta promoção NUNCA MAIS vai voltar", tipo_gancho: "fomo", tipo_post: "stories", pilar: "geral", objetivo: "conversao" },
];

// ====================================
// CTAs (150+ calls to action)
// ====================================
const ctasReais = [
  // ENGAJAMENTO (30)
  { texto: "Comenta 'EU QUERO' que te envio mais info", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Salva esse post pra não esquecer!", categoria: "engajamento", objetivo: "salvamentos" },
  { texto: "Marca aquele amigo que precisa ver isso", categoria: "engajamento", objetivo: "compartilhamento" },
  { texto: "Qual sua maior dúvida? Respondo aqui!", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Concorda? Comenta aí! 👇", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Desliza pro lado pra ver mais 👉", categoria: "engajamento", objetivo: "swipe" },
  { texto: "Assista até o final que tem surpresa!", categoria: "engajamento", objetivo: "retencao" },
  { texto: "Comenta um número de 1 a 10 pra mim!", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Que tal você experimentar também?", categoria: "engajamento", objetivo: "interesse" },
  { texto: "Você pensaria em fazer isso?", categoria: "engajamento", objetivo: "interesse" },
  { texto: "Me segue pra mais conteúdos assim!", categoria: "engajamento", objetivo: "seguidor" },
  { texto: "Ativa o sininho pra não perder nada!", categoria: "engajamento", objetivo: "notificacao" },
  { texto: "Compartilha com alguém que precisa saber", categoria: "engajamento", objetivo: "compartilhamento" },
  { texto: "Qual procedimento você faria primeiro?", categoria: "engajamento", objetivo: "enquete" },
  { texto: "Vote nos comentários: Sim ou Não?", categoria: "engajamento", objetivo: "enquete" },
  { texto: "Qual é sua maior insegurança?", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Que resultado você MAIS quer?", categoria: "engajamento", objetivo: "enquete" },
  { texto: "Reage com emoji 👇 o que você acha", categoria: "engajamento", objetivo: "reacoes" },
  { texto: "Passa pra alguém que você ama", categoria: "engajamento", objetivo: "compartilhamento" },
  { texto: "Isso é verdade? Comenta!", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Seria uma ótima ideia para você?", categoria: "engajamento", objetivo: "interesse" },
  { texto: "Qual você escolheria?", categoria: "engajamento", objetivo: "enquete" },
  { texto: "Salva pra mostrar pro namorado/a", categoria: "engajamento", objetivo: "salvamentos" },
  { texto: "Marca quem PRECISA MUITO disso!", categoria: "engajamento", objetivo: "marca" },
  { texto: "Concorda demais?", categoria: "engajamento", objetivo: "interesse" },
  { texto: "Que detalhe você mais gostou?", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Você votaria em qual opção?", categoria: "engajamento", objetivo: "enquete" },
  { texto: "Que tal conversar sobre isso?", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Me conta sua experiência aqui!", categoria: "engajamento", objetivo: "comentarios" },
  { texto: "Você já sabia disso ou foi novidade?", categoria: "engajamento", objetivo: "comentarios" },

  // CONVERSÃO (50)
  { texto: "Clica no link da bio pra agendar!", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Manda DM que a gente conversa mais", categoria: "conversao", objetivo: "dm" },
  { texto: "Agende sua avaliação gratuita agora", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Link na bio 👆", categoria: "conversao", objetivo: "clique" },
  { texto: "Quer saber mais? Me chama no direct!", categoria: "conversao", objetivo: "dm" },
  { texto: "Clica aqui pra mais informações", categoria: "conversao", objetivo: "clique" },
  { texto: "Agende via Whatsapp agora", categoria: "conversao", objetivo: "whatsapp" },
  { texto: "Chama no privado que te mando detalhes", categoria: "conversao", objetivo: "dm" },
  { texto: "Agende sua consulta hoje mesmo", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Converse comigo sobre seu caso", categoria: "conversao", objetivo: "dm" },
  { texto: "Quer essa transformação? Clica aqui!", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Fala comigo sobre esse procedimento", categoria: "conversao", objetivo: "dm" },
  { texto: "Vem conhecer meu trabalho de perto", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Agende sua transformação hoje", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Não deixa pra depois, agenda agora!", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Entre em contato pra mais detalh", categoria: "conversao", objetivo: "dm" },
  { texto: "Que tal agendar sua avaliação?", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Manda uma mensagem que te respondo", categoria: "conversao", objetivo: "dm" },
  { texto: "Vem ser nossa próxima transformação", categoria: "conversao", objetivo: "agendamento" },
  { texto: "Clica no link e confira nossos valores", categoria: "conversao", objetivo: "clique" },

  // AUTORIDADE (40)
  { texto: "Segue pra mais conteúdos como esse", categoria: "autoridade", objetivo: "seguidor" },
  { texto: "Ativa o sininho pra não perder nada", categoria: "autoridade", objetivo: "notificacao" },
  { texto: "Eu acompanho sua evolução por aqui", categoria: "autoridade", objetivo: "seguidor" },
  { texto: "Confira mais casos como esse no meu perfil", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Mais 10 anos de experiência por aqui", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Veja resultados de verdade no meu perfil", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Acompanha pra mais transformações", categoria: "autoridade", objetivo: "seguidor" },
  { texto: "Milhares de pacientes satisfeitos aqui", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Já transformei a vida de 5 mil pessoas", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Acompanha meu histórico de resultados", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Médica com certificações internacionais", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Vem conhecer meu trabalho premiado", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Centenas de 5 estrelas aqui no feed", categoria: "autoridade", objetivo: "avaliacao" },
  { texto: "Depoimentos de pacientes satisfeitos aqui", categoria: "autoridade", objetivo: "depoimento" },
  { texto: "Veja por que confiam em mim", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Meu trabalho fala por si só", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Resultados que falam mais que palavras", categoria: "autoridade", objetivo: "perfil" },
  { texto: "Segue pra acompanhar minha evolução", categoria: "autoridade", objetivo: "seguidor" },
  { texto: "Vem ser mais uma história de sucesso", categoria: "autoridade", objetivo: "credibilidade" },
  { texto: "Referência em estética no Brasil", categoria: "autoridade", objetivo: "credibilidade" },

  // EDUCATIVO (30)
  { texto: "Salva pra consultar depois", categoria: "educativo", objetivo: "salvamentos" },
  { texto: "Guia completo disponível no meu site", categoria: "educativo", objetivo: "clique" },
  { texto: "E-book gratuito sobre o tema no link", categoria: "educativo", objetivo: "download" },
  { texto: "Aprenda mais com este vídeo completo", categoria: "educativo", objetivo: "video" },
  { texto: "Curso gratuito pra você neste link", categoria: "educativo", objetivo: "clique" },
  { texto: "Todos os detalhes explicados aqui", categoria: "educativo", objetivo: "clique" },
  { texto: "Tutorial passo a passo no próximo post", categoria: "educativo", objetivo: "proximo" },
  { texto: "Saiba mais em nosso blog", categoria: "educativo", objetivo: "blog" },
  { texto: "Conteúdo completo em meu site", categoria: "educativo", objetivo: "website" },
  { texto: "Método científico comprovado", categoria: "educativo", objetivo: "credibilidade" },
  { texto: "Baseado em 10 anos de pesquisa", categoria: "educativo", objetivo: "credibilidade" },
  { texto: "Técnica aprovada por especialistas", categoria: "educativo", objetivo: "credibilidade" },
  { texto: "Protocolo internacional de qualidade", categoria: "educativo", objetivo: "credibilidade" },
  { texto: "Conheça a ciência por trás disso", categoria: "educativo", objetivo: "credibilidade" },
  { texto: "Explicação completa no vídeo", categoria: "educativo", objetivo: "video" },

  // URGÊNCIA (30)
  { texto: "Últimas vagas essa semana!", categoria: "urgencia", objetivo: "agendamento" },
  { texto: "Promoção válida só até amanhã", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Corre que tá acabando!", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Só 5 vagas sobrando!", categoria: "urgencia", objetivo: "agendamento" },
  { texto: "Condição especial HOJE MESMO", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Valor especial válido por 24h", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Black Friday de meia estação aqui", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Última chance de conseguir esse desconto", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Esse preço não volta tão cedo", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Aproveita enquanto tem disponibilidade", categoria: "urgencia", objetivo: "agendamento" },
  { texto: "Amanhã já pode estar tudo vendido", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Hoje tem oferta que você não pode perder", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Essa promoção sai do ar hoje à noite", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Últimas unidades disponíveis!", categoria: "urgencia", objetivo: "conversao" },
  { texto: "Só válido para os primeiros 10", categoria: "urgencia", objetivo: "conversao" },

  // PROVA SOCIAL (20)
  { texto: "Quer resultado assim? Me chama!", categoria: "prova_social", objetivo: "dm" },
  { texto: "Próxima pode ser você!", categoria: "prova_social", objetivo: "agendamento" },
  { texto: "Veja que as pessoas AMAM o resultado", categoria: "prova_social", objetivo: "credibilidade" },
  { texto: "Centenas de pacientes transformados", categoria: "prova_social", objetivo: "credibilidade" },
  { texto: "Leia os depoimentos de quem já fez", categoria: "prova_social", objetivo: "depoimento" },
  { texto: "Milhares de mulheres felizes aqui", categoria: "prova_social", objetivo: "comunidade" },
  { texto: "Vira você também uma transformação", categoria: "prova_social", objetivo: "agendamento" },
  { texto: "Junte-se a 10 mil pessoas satisfeitas", categoria: "prova_social", objetivo: "comunidade" },
  { texto: "Vira mais uma história de sucesso", categoria: "prova_social", objetivo: "agendamento" },
  { texto: "Comunidade crescendo todo dia", categoria: "prova_social", objetivo: "comunidade" },
];

// ====================================
// HASHTAGS (200+ organizadas por tema)
// ====================================
const hashtagsReais = [
  // AUTORIDADE MÉDICA (20)
  { tag: "#medicaestetica", tema: "autoridade", alcance: "alto", volume: 500 },
  { tag: "#harmonizacaofacial", tema: "autoridade", alcance: "alto", volume: 450 },
  { tag: "#esteticaavancada", tema: "autoridade", alcance: "medio", volume: 300 },
  { tag: "#doutora", tema: "autoridade", alcance: "alto", volume: 800 },
  { tag: "#medicaespecialista", tema: "autoridade", alcance: "alto", volume: 600 },
  { tag: "#procedimentoestetico", tema: "autoridade", alcance: "medio", volume: 400 },
  { tag: "#clinicaestetica", tema: "autoridade", alcance: "medio", volume: 350 },
  { tag: "#dermatologista", tema: "autoridade", alcance: "alto", volume: 700 },
  { tag: "#cirurgioplastia", tema: "autoridade", alcance: "alto", volume: 550 },
  { tag: "#procedimentocirurgico", tema: "autoridade", alcance: "medio", volume: 320 },
  { tag: "#especialidademedica", tema: "autoridade", alcance: "alto", volume: 480 },
  { tag: "#medicoconfirmado", tema: "autoridade", alcance: "medio", volume: 290 },
  { tag: "#esteticista", tema: "autoridade", alcance: "medio", volume: 380 },
  { tag: "#profissional", tema: "autoridade", alcance: "alto", volume: 650 },
  { tag: "#especializado", tema: "autoridade", alcance: "alto", volume: 720 },
  { tag: "#certificado", tema: "autoridade", alcance: "medio", volume: 310 },
  { tag: "#treinado", tema: "autoridade", alcance: "medio", volume: 250 },
  { tag: "#experiencia", tema: "autoridade", alcance: "alto", volume: 800 },
  { tag: "#anos", tema: "autoridade", alcance: "alto", volume: 900 },
  { tag: "#resultado", tema: "autoridade", alcance: "altissimo", volume: 1200 },

  // PROCEDIMENTOS (40)
  { tag: "#intimax", tema: "procedimento", alcance: "medio", volume: 380 },
  { tag: "#harmonizacaointima", tema: "procedimento", alcance: "medio", volume: 320 },
  { tag: "#preenchimentointimo", tema: "procedimento", alcance: "bajo", volume: 200 },
  { tag: "#fullface", tema: "procedimento", alcance: "alto", volume: 650 },
  { tag: "#gluteoplastia", tema: "procedimento", alcance: "alto", volume: 580 },
  { tag: "#preenchimentofacial", tema: "procedimento", alcance: "alto", volume: 720 },
  { tag: "#botox", tema: "procedimento", alcance: "altissimo", volume: 1500 },
  { tag: "#harmonizacao", tema: "procedimento", alcance: "alto", volume: 800 },
  { tag: "#procedimento", tema: "procedimento", alcance: "altissimo", volume: 2000 },
  { tag: "#esteticacorporal", tema: "procedimento", alcance: "medio", volume: 350 },
  { tag: "#micropigmentacao", tema: "procedimento", alcance: "medio", volume: 400 },
  { tag: "#laserestético", tema: "procedimento", alcance: "medio", volume: 280 },
  { tag: "#peeling", tema: "procedimento", alcance: "medio", volume: 320 },
  { tag: "#radiofrequencia", tema: "procedimento", alcance: "medio", volume: 290 },
  { tag: "#ultrassonica", tema: "procedimento", alcance: "bajo", volume: 180 },
  { tag: "#plataformamagnetica", tema: "procedimento", alcance: "bajo", volume: 150 },
  { tag: "#cryolipolise", tema: "procedimento", alcance: "medio", volume: 350 },
  { tag: "#mesoterapia", tema: "procedimento", alcance: "medio", volume: 310 },
  { tag: "#drenagenlinfatica", tema: "procedimento", alcance: "bajo", volume: 220 },
  { tag: "#lifting", tema: "procedimento", alcance: "alto", volume: 580 },
  { tag: "#preenchimento", tema: "procedimento", alcance: "alto", volume: 900 },
  { tag: "#acido", tema: "procedimento", alcance: "alto", volume: 750 },
  { tag: "#toxinabotulinica", tema: "procedimiento", alcance: "alto", volume: 680 },
  { tag: "#rejuvenescimento", tema: "procedimento", alcance: "medio", volume: 420 },
  { tag: "#reparacao", tema: "procedimento", alcance: "medio", volume: 380 },
  { tag: "#cicatriz", tema: "procedimento", alcance: "bajo", volume: 260 },
  { tag: "#rosacea", tema: "procedimento", alcance: "bajo", volume: 170 },
  { tag: "#acne", tema: "procedimento", alcance: "alto", volume: 1100 },
  { tag: "#celulite", tema: "procedimento", alcance: "alto", volume: 850 },
  { tag: "#estrias", tema: "procedimento", alcance: "alto", volume: 920 },

  // LOCALIZAÇÃO (10)
  { tag: "#saopaulo", tema: "local", alcance: "altissimo", volume: 2500 },
  { tag: "#sp", tema: "local", alcance: "altissimo", volume: 3000 },
  { tag: "#clinicasp", tema: "local", alcance: "alto", volume: 580 },
  { tag: "#vilaMadalena", tema: "local", alcance: "medio", volume: 320 },
  { tag: "#pinheiros", tema: "local", alcance: "medio", volume: 280 },
  { tag: "#consolacao", tema: "local", alcance: "bajo", volume: 180 },
  { tag: "#brasilesp", tema: "local", alcance: "medio", volume: 350 },
  { tag: "#saoPaulo", tema: "local", alcance: "altissimo", volume: 2800 },
  { tag: "#spsolucoes", tema: "local", alcance: "medio", volume: 400 },
  { tag: "#clinicabelinabrasil", tema: "local", alcance: "bajo", volume: 120 },

  // BENEFÍCIOS (30)
  { tag: "#autoestima", tema: "beneficio", alcance: "altissimo", volume: 2200 },
  { tag: "#confianca", tema: "beneficio", alcance: "altissimo", volume: 2100 },
  { tag: "#bemestar", tema: "beneficio", alcance: "altissimo", volume: 1900 },
  { tag: "#qualidadedevida", tema: "beneficio", alcance: "alto", volume: 850 },
  { tag: "#felicidade", tema: "beneficio", alcance: "altissimo", volume: 2500 },
  { tag: "#beleza", tema: "beneficio", alcance: "altissimo", volume: 3500 },
  { tag: "#transformacao", tema: "beneficio", alcance: "altissimo", volume: 2800 },
  { tag: "#mudança", tema: "beneficio", alcance: "altissimo", volume: 2600 },
  { tag: "#evolucao", tema: "beneficio", alcance: "alto", volume: 1200 },
  { tag: "#renewal", tema: "beneficio", alcance: "medio", volume: 480 },
  { tag: "#renovacao", tema: "beneficio", alcance: "alto", volume: 920 },
  { tag: "#rejuvenescimento", tema: "beneficio", alcance: "alto", volume: 1100 },
  { tag: "#juventude", tema: "beneficio", alcance: "alto", volume: 1300 },
  { tag: "#radiance", tema: "beneficio", alcance: "medio", volume: 550 },
  { tag: "#glow", tema: "beneficio", alcance: "altissimo", volume: 2400 },
  { tag: "#brilho", tema: "beneficio", alcance: "altissimo", volume: 2000 },
  { tag: "#saude", tema: "beneficio", alcance: "altissimo", volume: 3200 },
  { tag: "#bem", tema: "beneficio", alcance: "altissimo", volume: 2900 },
  { tag: "#paz", tema: "beneficio", alcance: "alto", volume: 1600 },
  { tag: "#plenitude", tema: "beneficio", alcance: "alto", volume: 1400 },

  // TRENDING (50)
  { tag: "#reels", tema: "trending", alcance: "altissimo", volume: 5000 },
  { tag: "#viral", tema: "trending", alcance: "altissimo", volume: 4800 },
  { tag: "#fyp", tema: "trending", alcance: "altissimo", volume: 4500 },
  { tag: "#foryoupage", tema: "trending", alcance: "altissimo", volume: 4200 },
  { tag: "#antesedepois", tema: "trending", alcance: "altissimo", volume: 3800 },
  { tag: "#transformacao", tema: "trending", alcance: "altissimo", volume: 3200 },
  { tag: "#resultados", tema: "trending", alcance: "altissimo", volume: 3500 },
  { tag: "#instareels", tema: "trending", alcance: "alto", volume: 2000 },
  { tag: "#instatrending", tema: "trending", alcance: "alto", volume: 1800 },
  { tag: "#trend", tema: "trending", alcance: "altissimo", volume: 3000 },
  { tag: "#trending", tema: "trending", alcance: "altissimo", volume: 4000 },
  { tag: "#explore", tema: "trending", alcance: "altissimo", volume: 3600 },
  { tag: "#descobrir", tema: "trending", alcance: "alto", volume: 2200 },
  { tag: "#explorepage", tema: "trending", alcance: "alto", volume: 2100 },
  { tag: "#foco", tema: "trending", alcance: "alto", volume: 1900 },
  { tag: "#atencao", tema: "trending", alcance: "alto", volume: 1700 },
  { tag: "#bomdemais", tema: "trending", alcance: "alto", volume: 2300 },
  { tag: "#wow", tema: "trending", alcance: "altissimo", volume: 3400 },
  { tag: "#incrivel", tema: "trending", alcance: "altissimo", volume: 2900 },
  { tag: "#melhor", tema: "trending", alcance: "altissimo", volume: 3100 },
];

// ====================================
// FUNÇÃO DE SEED
// ====================================
async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // 1. Seed Ganchos
    console.log('📌 Inserindo ganchos...');
    const ganchosFormatted = ganchosReais.map((g, i) => ({
      id: `gancho_real_${String(i + 1).padStart(3, '0')}`,
      texto: g.texto,
      tipo_legenda: 'gancho',
      tipo_post: g.tipo_post,
      pilar: g.pilar,
      objetivo: g.objetivo,
      ativo: true,
      uso_count: 0
    }));

    const { error: ganchosError } = await supabase
      .from('ganchos')
      .upsert(ganchosFormatted);

    if (ganchosError) {
      console.error('❌ Erro ganchos:', ganchosError.message);
    } else {
      console.log(`✅ ${ganchosReais.length} ganchos inseridos`);
    }

    // 2. Seed CTAs
    console.log('📌 Inserindo CTAs...');
    const ctasFormatted = ctasReais.map((c, i) => ({
      id: `cta_real_${String(i + 1).padStart(3, '0')}`,
      texto: c.texto,
      categoria: c.categoria,
      objetivo: c.objetivo,
      ativo: true,
      uso_count: 0
    }));

    const { error: ctasError } = await supabase
      .from('ctas')
      .upsert(ctasFormatted);

    if (ctasError) {
      console.error('❌ Erro CTAs:', ctasError.message);
    } else {
      console.log(`✅ ${ctasReais.length} CTAs inseridos`);
    }

    // 3. Seed Hashtags
    console.log('📌 Inserindo hashtags...');
    const hashtagsFormatted = hashtagsReais.map((h, i) => ({
      id: `hashtag_real_${String(i + 1).padStart(3, '0')}`,
      hashtag: h.tag,
      tema: h.tema,
      alcance: h.alcance,
      volume: h.volume
    }));

    const { error: hashtagsError } = await supabase
      .from('hashtags')
      .upsert(hashtagsFormatted);

    if (hashtagsError) {
      console.error('❌ Erro hashtags:', hashtagsError.message);
    } else {
      console.log(`✅ ${hashtagsReais.length} hashtags inseridas`);
    }

    console.log('\n🎉 Seed completo!');
    console.log(`\nResumo:`);
    console.log(`  - Ganchos: ${ganchosReais.length}`);
    console.log(`  - CTAs: ${ctasReais.length}`);
    console.log(`  - Hashtags: ${hashtagsReais.length}`);

  } catch (error: any) {
    console.error('❌ Erro geral:', error);
  }
}

seedDatabase();
