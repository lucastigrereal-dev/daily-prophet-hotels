import seed from './seed-original.json'
import { editorialOverlay, type Template } from './domain'
/** Server-owned original text drafts. Seed preserved; 015 quarantined. No media/publication approval. */
export const draftCatalog:Template[]=editorialOverlay(seed.templates.map(t=>({...t,content:Object.fromEntries(Object.entries(t.content).filter(([,v])=>v!==undefined)) as Record<string,string|string[]>})))
