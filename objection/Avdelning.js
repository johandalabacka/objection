// import { Model} from './objection.js'
import { Model } from './objection.js'
import { Model } from 'objection'
import Beslutsorganisation from './Beslutsorganisation.js'
import Fakultet from './Fakultet.js'

class Avdelning extends Model {
  static get tableName () {
    return 'Avdelning'
  }

  static get idColumn () {
    return 'avdelningId'
  }

  get names () {
    return { sv: `${this.avdelningKod} - ${this.avdelningSve}`, en: `${this.avdelningKod} - ${this.avdelningEng}` }
  }

  get shortName () {
    return this.avdelningKod
  }

  static get relationMappings () {
    return {
      moderavdelning: {
        relation: Model.HasOneRelation,
        modelClass: Avdelning,
        join: {
          from: 'Avdelning.moderavdelningId',
          to: 'Avdelning.avdelningId'
        }
      },
      beslutsorganisation: {
        relation: Model.HasOneRelation,
        modelClass: Beslutsorganisation,
        join: {
          from: 'Avdelning.utbNamndFK',
          to: 'UtbNamnd.utbNamndId'
        }
      },
      fakultet: {
        relation: Model.HasOneRelation,
        modelClass: Fakultet,
        join: {
          from: 'Avdelning.fakultetFK',
          to: 'Fakultet.fakultetId'
        }
      }
    }
  }
}

export default Avdelning
