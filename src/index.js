const { ApolloServer, gql } = require("apollo-server-express");
const shortid = require("shortid");
const { mkdir, createWriteStream } = require("fs");
const pathDependencie = require("path");
const cors = require("cors");
const express = require("express");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const app = express();

const typeDefs = gql`
  type File {
    filename: String!
    path: String!
  }

  type Query {
    uploads: [File]
    hello: String
    allUpload: [File]
  }

  type Mutation {
    singleUpload(file: Upload!): File!
    arrayUpload(files: [Upload]!): [File]!
  }
`;
/* 
  TODO:
  * Subir imagenes a cloudinary (al menos una) [x]
  * Subir un arreglo de imagenes a cloudinary [x]
  * Subir ina imagen a la carpeta del server (al menos una) [x]
  * Subir un arreglo de imagenes en el server [x]
  * Creada carpeta images fuera de src y accedida a traves de el browser[x]
*/
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const arrayFiles = [];
const host = "http://localhost:4000/";

const imageDir = pathDependencie.join(__dirname, "../images");
app.use("/images", express.static(imageDir)); // serve all files in the /images directory
app.use(cors());
const storeUpload = async ({ stream, filename, mimetype }) => {
  const id = shortid.generate();
  const path = `images/${id}-${filename}`;
  return new Promise((resolve, reject) =>
    stream
      .pipe(createWriteStream(path))
      .on("finish", () => resolve({ id, path, filename, mimetype }))
      .on("error", reject)
  );
};
const processUpload = async (upload) => {
  const { createReadStream, filename, mimetype } = await upload;
  const stream = createReadStream();
  const file = await storeUpload({ stream, filename, mimetype });
  return file;
};

const resolvers = {
  Query: {
    uploads: (parent, args) => {},
    hello: (parent, args) => "s",
    allUpload: (parent, args) => arrayFiles,
  },
  Mutation: {
    singleUpload: async (parent, { file }) => {
      mkdir("images", { recursive: true }, (err) => {
        if (err) throw err;
      });
      const upload = await processUpload(file);
      upload.path = `${host}${upload.path}`;
      return upload;
    },
    arrayUpload: async (parent, { files }) => {
      await files.map(async (file) => {
        mkdir(
          pathDependencie.join(__dirname, "images"),
          { recursive: true },
          (err) => {
            if (err) throw err;
          }
        );
        const upload = await processUpload(file);
        upload.path = `${host}${upload.path}`;
        arrayFiles.push(upload);
        console.log("file single", upload);
      });
      console.log("Array:", arrayFiles);
      return arrayFiles;
    },

    // singleUpload: async (parent, { file }) => {
    //   const { filename, createReadStream } = await file;
    //   try {
    //     const result = await new Promise((resolve, reject) => {
    //       createReadStream().pipe(
    //         cloudinary.uploader.upload_stream((error, imageUpload) => {
    //           if (error) return reject(error);

    //           resolve(imageUpload);
    //         })
    //       );
    //     });

    //     return {
    //       filename,
    //       path: result.secure_url,
    //     };
    //   } catch (err) {
    //     console.log(err);
    //   }
    // },

    // arrayUpload: async (parent, { files }) => {
    //   await files.map(async (file) => {
    //     const { filename, createReadStream } = await file;
    //     try {
    //       const result = await new Promise((resolve, reject) => {
    //         createReadStream().pipe(
    //           cloudinary.uploader.upload_stream((error, imageUpload) => {
    //             if (error) return reject(error);

    //             resolve(imageUpload);
    //           })
    //         );
    //       });
    //       /*
    //       Momentananeamente se guarda en un array de files ya que es lo que retorna,
    //       estos datos deben guardarse en un arreglo en la base de datos, usando una consulta Cypher
    //       para el file type y asi se vaya creando el arraglo de file
    //       Por cada uno de las imagenes se guarda en la bd la ruta
    //       */
    //       console.log(result);
    //       const resultFile = {
    //         filename,
    //         path: result.secure_url,
    //       };
    //       arrayFiles.push(resultFile);
    //     } catch (err) {
    //       console.log(err);
    //     }
    //   });
    //   return arrayFiles;
    // },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
server.applyMiddleware({ app });
app.listen(4000, () => {
  console.log(`🚀 server running @ http://localhost:4000`);
});
