const { ApolloServer, gql } = require("apollo-server");
const cloudinary = require("cloudinary").v2;
const typeDefs = gql`
  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Query {
    uploads: [File]
    hello: String
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    arrayUpload(files: [Upload]!): [File]
  }
`;
/* 
  TODO:
  * Subir imagenes a clodionary (al menos una)
  * Subir ina imagen a la catpeta del server (al menos una)
  * Subit un arreglo de imagenes en el server

*/
const resolvers = {
  Query: {
    uploads: (parent, args) => {},
    hello: (parent, args) => "s",
  },
  Mutation: {
    singleUpload: async (parent, { file }) => {
      const { filename, mimetype, createReadStream } = await file;
    },
    arrayUpload: async (parent, { files }) => {
      console.log(files);
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
