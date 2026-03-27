import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { schema } from './graphql/schema.js';
import dotenv from 'dotenv';
import { authMiddleware } from "./authMiddleware.js";

dotenv.config();

export const createApp = async () => {
  const app = express();
  const server = new ApolloServer({ schema });
  await server.start();

  app.use(express.json());
  app.use(cors());

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