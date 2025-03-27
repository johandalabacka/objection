import Kurs from './Kurs.js'
import db from './db.js'

console.time('query')
for (let i = 0; i < 100; i++) {
  const query = Kurs.query().where({ kursId: 20000 + i }).first()
    .select('kursId', 'kurskod', 'avdelningFK')
    .withGraphFetched({
      avdelning: {
        moderavdelning: true
      },
      kursProgram: {
        program: true
      }
    })
    .modifyGraph('avdelning', builder => {
      builder.select('avdelningId', 'avdelningEng', 'moderavdelningId')
    })
    .modifyGraph('kursProgram', builder => {
      builder.innerJoin('Program as _p', '_p.programId', 'Kurs_Program.programFK')
        .orderBy('programKod', 'desc')
    })
    .modifyGraph('program', builder => {
      builder.select('programId', 'programKod')
    })




  const result = await query
}
console.timeEnd('query')
console.log(process.memoryUsage())
// console.dir(result, { depth: 999 })


await db.destroy()