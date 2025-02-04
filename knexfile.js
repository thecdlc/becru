module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/realestate.db'
    },
    useNullAsDefault: true, 
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: './database/realestate.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
