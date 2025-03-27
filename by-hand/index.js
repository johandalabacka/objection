import db from './db.js'

async function getKurser(filter) {
  const query = db('Kurs as k')
  filter.related = new Set(filter.related?.split(',') || [])
  if (filter.kursId) {
    query.where('k.kursId', filter.kursId)
  }
  if (filter.offset) {
    query.offset(filter.offset)
  }
  if (filter.limit) {
    query.limit(filter.limit)
  }
  const kurser = await query

  const relatedPromises = []
  if (filter.related.has('avdelning')) {
    relatedPromises.push(fetchRelatedAvdelning(kurser))
  }
  if (filter.related.has('kursProgram')) {
    relatedPromises.push(fetchRelatedKursProgram(kurser, filter))
  }

  await Promise.all(relatedPromises)

  return kurser
}

async function fetchRelatedAvdelning(kurser) {

  const avdelningar = await db('Avdelning as a')
    .whereIn('a.avdelningId', kurser.map(k => k.avdelningFK))
  const avdelningIdToAvdelning = new Map(avdelningar.map(a => [a.avdelningId, a]))
  kurser.forEach(kurs => {
    kurs.avdelning = avdelningIdToAvdelning.get(kurs.avdelningFK) ?? null
  })
}

async function fetchRelatedKursProgram(kurser, filter) {
  const kursIds = []
  const kursIdToKurs = new Map()
  kurser.forEach(kurs => {
    kursIds.push(kurs.kursId)
    kursIdToKurs.set(kurs.kursId, kurs)
    kurs.kursProgram = []
  })

  const kursProgram = await db('Kurs_Program as kp')
    .whereIn('kp.kursFK', kursIds)
  kursProgram.forEach(kp => {
    const kurs = kursIdToKurs.get(kp.kursFK)
    kurs.kursProgram.push(kp)
  })

  if (filter.related.has('program')) {
    await fetchRelatedProgram(kursProgram)
  }
}

async function fetchRelatedProgram(kursProgram) {
  const programIds = kursProgram.map(kp => kp.programFK)
  const programs = await db('Program as p')
    .whereIn('p.programId', programIds)
  const programIdToProgram = new Map(programs.map(p => [p.programId, p]))
  kursProgram.forEach(kp => {
    kp.program = programIdToProgram.get(kp.programFK) ?? null
  })
}

console.time('query')
for (let i = 0; i < 100; i++) {
  const kurser = await getKurser({ kursId: 20000 + i, related: 'avdelning,kursProgram,program' })
}
// console.dir(kurser, { depth: null })
console.timeEnd('query')
console.log(process.memoryUsage())
await db.destroy()