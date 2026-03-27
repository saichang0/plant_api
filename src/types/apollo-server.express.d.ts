import { ApolloServer } from '@apollo/server';
import { RequestHandler } from 'express';

declare module '@apollo/server/express4' {
  export function expressMiddleware(
    server: ApolloServer,
    options?: {
      context?: (params: { req: any; res: any }) => Promise<Record<string, any>>;
    }
  ): RequestHandler;
}