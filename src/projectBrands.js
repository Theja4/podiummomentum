/**
 * Public-facing case-study aliases.
 *
 * Rezoomed and JobPosted are intentionally absent: they are the two approved
 * real brands and should keep their original names everywhere on the site.
 */
export const projectBrandAliases = {
  'The Virtual Slimming Clinic': 'VivaWell Clinic',
  'Sophisticated Traders': 'MarketFoundry',
  'Creatine Gummies': 'CoreChews',
  'Freeport Markets': 'HarborX',
  'Planet9 UI/UX': 'OrbitNine UX',
  'Oasira UI/UX': 'HabitatIQ UX',
  'Frado UI/UX': 'Pathwise UX',
  'Zolve UI/UX': 'LumaPay UX',
  'Alpha Ledger': 'Northstar Ledger',
  'Sofia Therapy': 'Haven Therapy',
  'Dubai Realty': 'DuneKey',
  'Modern Vivo': 'BioCanvas',
  ModernVivo: 'BioCanvas',
  'Hybrid Mind': 'Synapse Works',
  'Vertus AI': 'Axiom Arc',
  'Frado AI': 'Pathwise AI',
  'Jogg AI': 'MotionMint AI',
  InnRevAI: 'Revora AI',
  InnrevAI: 'Revora AI',
  Innrevai: 'Revora AI',
  InnRev: 'Revora AI',
  'Traders Hub': 'MarketFoundry',
  'Pie Assets': 'Bricklane Capital',
  'ReadyRX': 'RxPilot',
  'Get Talky': 'CareLuma',
  'NS Store': 'North & Silk',
  ContinuOS: 'Nively OS',
  SuperMeme: 'MemeForge',
  'Liquid Meme': 'FlowMint',
  Fractalized: 'FractalNova',
  Neurofall: 'FractalNova',
  Multikassa: 'PolyTill',
  Multibank: 'PolyBank',
  PATtech: 'TerraPulse',
  Scalemont: 'SignalPeak',
  TitanX: 'SignalPeak',
  UzOman: 'Meridian Gulf',
  SAAKINUN: 'Atelier Nura',
  HFactor: 'HydraVolt',
  Hfactor: 'HydraVolt',
  Glowskin: 'LumaSkin',
  Metapic: 'LikeOn',
  Planet9: 'OrbitNine',
  Vanquish: 'VantageOne',
  Vantir: 'VantageOne',
  Taraxa: 'Axion Chain',
  Liquild: 'FlowMint',
  Shaka: 'NovaSIM',
  Incipet: 'Kyntra',
  Sarwisi: 'Taskora',
  Vertus: 'Axiom Arc',
  Hybrid: 'Synapse Works',
  Vyvo: 'HabitatIQ',
  Builtly: 'Buildory',
  Rahmat: 'Tapora',
  Reddex: 'Redhaven',
  Beedew: 'Wellnest',
  BeU: 'Wellnest',
  Serenity: 'CalmSpring',
  Foothills: 'CalmSpring',
  'Hey.md': 'MellowMD',
  Script: 'Medora',
  Frado: 'Pathwise',
  Jogg: 'MotionMint',
  HCG: 'Crestline Group',
  Siwa: 'Alderhouse',
  QDT: 'QuantaDesk',
  XIM: 'Mixora',
}

const aliasEntries = Object.entries(projectBrandAliases)
  .sort(([a], [b]) => b.length - a.length)

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function aliasProjectName(name) {
  if (!name) return name
  const direct = projectBrandAliases[name]
  if (direct) return direct
  const match = aliasEntries.find(([source]) => source.toLowerCase() === String(name).toLowerCase())
  return match?.[1] || name
}

export function aliasProjectText(value) {
  if (!value) return value
  return aliasEntries.reduce(
    (text, [source, alias]) => text.replace(
      new RegExp(`(^|[^A-Za-z0-9])(${escapeRegExp(source)})(?![A-Za-z0-9])`, 'gi'),
      (_, prefix) => `${prefix}${alias}`,
    ),
    String(value),
  )
}
