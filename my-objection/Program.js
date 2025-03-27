import { Model } from './objection.js'
// import { Model } from 'objection'

class Program extends Model {
  static FRIST = null

  static get tableName() {
    return 'Program'
  }

  static get idColumn() {
    return 'programId'
  }

  get names() {
    return { sv: `${this.programKod} - ${this.programSve}`, en: `${this.programKod} - ${this.programEng}` }
  }

  get shortName() {
    return this.programKod
  }
}

export default Program
