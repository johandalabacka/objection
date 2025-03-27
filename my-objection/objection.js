import knex from 'knex'

function qualifiedNameToName(colName) {
  const index = colName.lastIndexOf('.')
  if (index === -1) {
    return colName
  }
  return colName.slice(index + 1)
}

export class Model {
  static HasOneRelation = Symbol('HasOneRelation')
  static HasManyRelation = Symbol('HasManyRelation')
  static ManyToManyRelation = Symbol('ManyToManyRelation')

  static from(obj) {
    const instance = new this()
    Object.assign(instance, obj)
    return instance
  }

  static rela

  static knex(knexInstance) {
    Model.knexInstance = knexInstance
  }

  static get tableName() {
    throw new Error('getter tableName not defined')
  }

  static get idColumn() {
    throw new Error('getter idColumn not defined')
  }

  static get relationMappings() {
    return {}
  }

  static query() {
    const modelClass = this
    return new Proxy(Model.knexInstance(this.tableName), {
      get(target, prop, receiver) {
        if (prop === 'then') {
          return async callback => {
            // console.log('calling then')
            // If no select is used, make an explicit <table>.* select
            if (
              !target._statements.some(
                statement => statement.grouping === 'columns'
              )
            ) {
              target.select(`${modelClass.tableName}.*`)
            }
            const result = await target
            if (Array.isArray(result)) {
              const instances = result.map(r => modelClass.from(r))
              // console.log('before')
              if (instances.length > 0) {
                await modelClass._withRelated(target.__related, instances)
              }
              callback(instances)
              return
            } else {
              const instance = modelClass.from(result)
              if (instance) {
                // console.log('before')
                await modelClass._withRelated(target.__related, [instance])
              }
              callback(instance)
            }
          }
        } else if (prop === 'include') {
          return args => {
            target.__related = args
            return receiver
          }
        }
        return target[prop]
      }
    })
  }

  /**
   * 
   * @param {string} relationName 
   * @returns {Promise<Model | Model[]>}
   */
  async $relatedQuery(relationName) {
    const relationMapping = this.constructor.relationMappings[relationName]
    if (!relationMapping) {
      throw new Error(`Unknown relation ${relationName}`)
    }
    if (relationMapping.relation === Model.HasOneRelation) {
      return await this.#withRelatedQueryHasOneRelation(relationMapping)
    } else if (relationMapping.relation === Model.HasManyRelation) {
      return await this.#withRelatedQueryHasManyRelation(relationMapping)
    } else {
      throw new Error(
        `Unknown relation type ${relationMapping.relation.toString()}`
      )
    }
  }

  /**
   * 
   * @param {import('.').RelationMapping} relationMapping 
   * @returns {Promise<Model>}
   */
  async #withRelatedQueryHasOneRelation(relationMapping) {
    const modelClass = relationMapping.modelClass
    const fromColumn = qualifiedNameToName(relationMapping.join.from)
    const qualifiedToColumn = relationMapping.join.to
    const row = await modelClass
      .query()
      .where(qualifiedToColumn, this[fromColumn])
      .first()
    return modelClass.from(row)
  }

  /**
   * 
   * @param {import('.').RelationMapping} relationMapping 
   * @returns {Promise<Model[]>}
   */
  async #withRelatedQueryHasManyRelation(relationMapping) {
    const modelClass = relationMapping.modelClass
    const fromColumn = qualifiedNameToName(relationMapping.join.from)
    const qualifiedToColumn = relationMapping.join.to
    const rows = await modelClass
      .query()
      .where(qualifiedToColumn, this[fromColumn])
    return rows.map(row => modelClass.from(row))
  }

  /**
   * 
   * @param {} related 
   * @param {Model[]} instances 
   * @returns 
   */
  static async _withRelated(related, instances) {
    if (!related) {
      return
    }
    for (const [relationName, relationValue] of Object.entries(related)) {
      // console.log('withRelated', relationName, relationValue)
      if (!relationValue) {
        continue
      }
      const relationMapping = this.relationMappings[relationName]
      if (!relationMapping) {
        throw new Error(`Unknown relation ${relationName}`)
      }

      // @todo promises array
      if (relationMapping.relation === Model.HasOneRelation) {
        // console.log(this)
        await withRelatedHasOneRelation(
          relationName,
          relationMapping,
          relationValue,
          instances
        )
      } else if (relationMapping.relation === Model.HasManyRelation) {
        await withRelatedHasManyRelation(
          relationName,
          relationMapping,
          relationValue,
          instances
        )
      } else {
        throw new Error(
          `Unknown relation type ${relationMapping.relation.toString()}`
        )
      }
    }
  }
}

async function withRelatedHasOneRelation(
  relationName,
  relationMapping,
  relationValue,
  instances
) {
  /* console.log({
    relationName,
    relationMapping,
    relationValue,
    instances
  }) */
  const modelClass = relationMapping.modelClass
  const fromColumn = qualifiedNameToName(relationMapping.join.from)
  const qualifiedToColumn = relationMapping.join.to
  const toColumn = qualifiedNameToName(qualifiedToColumn)
  const ids = instances.map(instance => instance[fromColumn])
  const query = modelClass.query().whereIn(qualifiedToColumn, ids)
  if (relationValue?.filter) {
    relationValue.filter(query)
  }
  const rows = await query
  if (rows.length === 0) {
    // @todo set Columns on instances
    return
  }
  const keyToRelatedInstance = new Map()
  for (const row of rows) {
    const relatedInstance = modelClass.from(row)
    const relatedKey = relatedInstance[toColumn]
    keyToRelatedInstance.set(relatedKey, relatedInstance)
  }
  for (const instance of instances) {
    const relatedKey = instance[fromColumn]
    const relatedInstance = keyToRelatedInstance.get(relatedKey) ?? null
    instance[relationName] = relatedInstance ?? null
  }
  if (relationValue?.include) {
    const relatedInstances = Array.from(keyToRelatedInstance.values())
    await modelClass._withRelated(relationValue?.include, relatedInstances)
  }
}

/**
 * 
 * @param {string} relationName 
 * @param {} relationMapping 
 * @param {*} relationValue 
 * @param {Model[]} instances 
 * @returns 
 */
async function withRelatedHasManyRelation(
  relationName,
  relationMapping,
  relationValue,
  instances
) {
  const modelClass = relationMapping.modelClass
  const fromColumn = qualifiedNameToName(relationMapping.join.from)
  const qualifiedToColumn = relationMapping.join.to
  const toColumn = qualifiedNameToName(qualifiedToColumn)
  const ids = instances.map(instance => instance[fromColumn])
  const query = modelClass.query().whereIn(qualifiedToColumn, ids)
  if (relationValue?.filter) {
    relationValue.filter(query)
  }
  const rows = await query
  if (rows.length === 0) {
    return
  }
  const keyToRelatedInstances = new Map()
  const relatedInstances = []
  for (const row of rows) {
    const relatedInstance = modelClass.from(row)
    relatedInstances.push(relatedInstance)
    const relatedKey = relatedInstance[toColumn]
    let relatedForKey = keyToRelatedInstances.get(relatedKey)
    if (!relatedForKey) {
      relatedForKey = []
      keyToRelatedInstances.set(relatedKey, relatedForKey)
    }
    relatedForKey.push(relatedInstance)
  }

  for (const instance of instances) {
    const relatedKey = instance[fromColumn]
    instance[relationName] = keyToRelatedInstances.get(relatedKey) ?? []
  }
  if (relationValue?.include) {
    await modelClass._withRelated(relationValue.include, relatedInstances)
  }
}


