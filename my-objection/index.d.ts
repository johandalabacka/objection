import Model from './objection.js'
import { Knex } from 'knex'

interface RelationMapping {
  modelClass: Model
  relation:
    | Model.Model.HasOneRelation
    | Model.HasManyRelation
    | Model.ManyToManyRelation
  join: {
    from: string
    to: string
  }
}

type Related = boolean | RelatedObject

interface RelatedObject {
  filter: Knex<any, unknown[]>
  include: Related
}
