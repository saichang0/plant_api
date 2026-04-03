import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { schema } from './graphql/schema.js';
import dotenv from 'dotenv';
import { authMiddleware } from "./authMiddleware.js";
import { uploadToCloudinary } from './utils/uploadImage.js';

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

export const createApp = async () => {
  const app = express();
  const server = new ApolloServer({ schema });
  await server.start();

  app.use(express.json());
  app.use(cors());

  // Image upload endpoint
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file provided' });
        return;
      }

      const result = await uploadToCloudinary(req.file);
      res.json({ data: { url: result.url, publicId: result.publicId } });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Failed to upload image' });
    }
  });

  // Attach auth middleware and Apollo on the same route so requests get JSON GraphQL responses
  app.use(
    '/graphql',
    authMiddleware,
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  return { app };
};