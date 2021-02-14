const { ApolloServer, gql } = require("apollo-server");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const typeDefs = gql`
  type File {
    filename: String!
    path: String!
  }

  type Query {
    uploads: [File]
    hello: String
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    arrayUpload(files: [Upload]!): [File]!
  }
`;
/* 
  TODO:
  * Subir imagenes a cloudinary (al menos una) [x]
  * Subir ina imagen a la carpeta del server (al menos una) 
  * Subir un arreglo de imagenes en el server

  */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const arrayFiles = [];

const resolvers = {
  Query: {
    uploads: (parent, args) => {},
    hello: (parent, args) => "s",
  },
  Mutation: {
    singleUpload: async (parent, { file }) => {
      const { filename, createReadStream } = await file;
      try {
        const result = await new Promise((resolve, reject) => {
          createReadStream().pipe(
            cloudinary.uploader.upload_stream((error, imageUpload) => {
              if (error) return reject(error);

              resolve(imageUpload);
            })
          );
        });

        return {
          filename,
          path: result.secure_url,
        };
      } catch (err) {
        console.log(err);
      }
    },
    arrayUpload: async (parent, { files }) => {
      await files.map(async (file) => {
        const { filename, createReadStream } = await file;
        try {
          const result = await new Promise((resolve, reject) => {
            createReadStream().pipe(
              cloudinary.uploader.upload_stream((error, imageUpload) => {
                if (error) return reject(error);

                resolve(imageUpload);
              })
            );
          });
          /*  
          Momentananeamente se guarda en un array de files ya que es lo que retorna, 
          estos datos deben guardarse en un arreglo en la base de datos, usando una consulta Cypher 
          para el file type y asi se vaya creando el arraglo de file
          */
          console.log(result);
          const resultFile = {
            filename,
            path: result.secure_url,
          };
          arrayFiles.push(resultFile);
        } catch (err) {
          console.log(err);
        }
      });
      return arrayFiles;
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
