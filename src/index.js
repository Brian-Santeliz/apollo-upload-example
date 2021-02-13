const { ApolloServer, gql } = require("apollo-server");

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
  }
`;

const resolvers = {
  Query: {
    uploads: (parent, args) => {},
    hello: (parent, args) => "s",
  },
  Mutation: {
    singleUpload: async (parent, { file }) => {
      const { filename, mimetype, createReadStream } = await file;

      console.log("filename:", filename);
      console.log("mimetype:", mimetype);
      console.log("createReadStream:", createReadStream);
      return {
        filename,
      };
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
