import { Model } from './objection.js'
// import { Model } from 'objection'
import Kurs from './Kurs.js'
import Program from './Program.js'

class KursProgram extends Model {
  static get tableName() {
    return 'Kurs_Program'
  }

  static get idColumn() {
    return 'kursProgramId'
  }

  get names() {
    return this.program?.names
  }

  get shortName() {
    return this.program?.shortName
  }

  static get relationMappings() {
    return {
      kurs: {
        relation: Model.HasOneRelation,
        modelClass: Kurs,
        join: {
          from: 'Kurs_Program.kursFK',
          to: 'Kurs.kursId'
        }
      },
      program: {
        relation: Model.HasOneRelation,
        modelClass: Program,
        join: {
          from: 'Kurs_Program.programFK',
          to: 'Program.programId'
        }
      }
    }
  }
}

export default KursProgram
