import Kurs from './Kurs.js'
import db from './db.js'

console.time('query')
for (let i = 0; i < 100; i++) {
  const query = Kurs.query().where({ kursId: 20000 + i }).first()
    .select('kursId', 'kurskod', 'avdelningFK')
    .include({
      avdelning: {
        filter: q => q.select('avdelningId', 'avdelningEng', 'moderavdelningId'),
        include: {
          moderavdelning: true
        }
      },
      kursProgram: {
        include: {
          program: { filter: q => q.select('programId', 'programKod') }
        },
        filter: q => q.innerJoin('Program as _p', '_p.programId', 'Kurs_Program.programFK')
          .orderBy('programKod', 'desc')
      }
    })

  const result = await query
}
console.timeEnd('query')
console.log(process.memoryUsage())
// console.dir(result, { depth: 999 })


await db.destroy()
