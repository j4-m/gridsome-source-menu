const path = require('path')
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID
} = require('gridsome/graphql')

class MenuSource {
  static defaultOptions () {
    return {
      path: '',
      menuTypeName: 'Menu',
      menuLinkTypeName: 'MenuLink',
    }
  }

  constructor (api, options) {
    this.api = api
    this.options = options
    this.context = options.baseDir
      ? api.resolve(options.baseDir)
      : api.context
    api.loadSource(async actions => {
      await this.createSchemasTypes(actions)
      await this.extendSchema(actions)
      await this.createNodes()
    })
  }

  async createSchemasTypes ({addSchemaTypes, addCollection, schema }) {
    this.menuCollection = addCollection(this.options.menuTypeName)
    this.menuLinkCollection = addCollection(this.options.menuLinkTypeName)
    addSchemaTypes([
      schema.createObjectType({
        name: this.options.menuTypeName,
        interfaces: ['Node'],
        fields: {
          id: 'ID!',
          name: 'String',
          links: {
            type: `[${this.options.menuLinkTypeName}]`,
            resolve: (obj) => this.menuLinkCollection.findNodes({ menu: obj.id, depth: 0 })
          }
        }
      }),
      schema.createObjectType({
        name: this.options.menuLinkTypeName,
        interfaces: ['Node'],
        fields: {
          id: 'ID!',
          title: 'String!',
          url: 'String!',
          parent: 'MenuLink',
          menu: this.options.menuTypeName,
          depth: 'Int!',
          order: 'Int!',
          children: {
            type: `[${this.options.menuLinkTypeName}]`,
            resolve: (obj) => this.menuLinkCollection.findNodes({ parent: obj.id })
          }
        }
      })
    ])
  }

  extendSchema({addSchema, getCollection}) {
    addSchema(new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          menuLink: {
            type: 'MenuLink',
            args: {
              id: {
                type: GraphQLID
              },
              url: {
                type: GraphQLString
              },
            },
            resolve: (obj, args) => getCollection('MenuLink').findNode(args)
          }
        }
      })
    }))
  }

  createLinks(links, menu, depth = 0, parent = false) {
    let order = 0;
    for (const { link, children } of links) {
      const menuLink = this.menuLinkCollection.addNode({
        title: link.title,
        url: link.url,
        menu: menu.id,
        depth,
        parent: parent ? parent.id : undefined,
        order
      })
      order++
      if (children) {
        this.createLinks(children, menu, depth+1, menuLink)
      }
    }
  }

  async createNodes () {
    const glob = require('globby')
    const menuFiles = await glob(this.options.path, { cwd: this.context })
    menuFiles.map(menuFile => {
      const origin = path.join(this.context, menuFile)
      const { id, name, links} = require(origin)
      const menu = this.menuCollection.addNode({ id, name })
      this.createLinks(links, menu)
    })
  }

}

module.exports = MenuSource