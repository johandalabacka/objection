import { Model } from 'objection'

class Avdelning extends Model {
  static get tableName() {
    return 'Avdelning'
  }

  static get idColumn() {
    return 'avdelningId'
  }

  static get relationMappings() {
    return {
      moderavdelning: {
        relation: Model.HasOneRelation,
        modelClass: Avdelning,
        join: {
          from: 'Avdelning.moderavdelningId', // 'Kurs.avdelningFK',
          to: 'Avdelning.avdelningId'
        }
      }
    }
  }
}

class KursProgram extends Model {
  static get tableName() {
    return 'Kurs_Program'
  }

  static get idColumn() {
    return 'kursProgramId'
  }

  static get relationMappings() {
    return {
      program: {
        relation: Model.HasOneRelation,
        modelClass: Program,
        join: {
          from: 'Kurs_Program.programFK', // 'Kurs.avdelningFK',
          to: 'Program.programId'
        }
      }
    }
  }
}

class Program extends Model {
  static get tableName() {
    return 'Program'
  }

  static get idColumn() {
    return 'programId'
  }
}

export default class Kurs extends Model {
  static get tableName() {
    return 'Kurs'
  }

  static get idColumn() {
    return 'kursId'
  }

  static get relationMappings() {
    return {
      avdelning: {
        relation: Model.HasOneRelation,
        modelClass: Avdelning,
        join: {
          from: 'Kurs.avdelningFK',
          to: 'Avdelning.avdelningId'
        }
      },
      kursProgram: {
        relation: Model.HasManyRelation,
        modelClass: KursProgram,
        join: {
          from: 'Kurs.kursId',
          to: 'Kurs_Program.kursFK'
        }
      }
    }
  }
}
