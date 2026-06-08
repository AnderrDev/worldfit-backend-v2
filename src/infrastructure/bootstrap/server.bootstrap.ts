import express from 'express';
import http from 'http';

export class ServerBootstrap {
  private app: express.Application;

  constructor(app: express.Application) {
    this.app = app;
  }

  init(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);
      const PORT = process.env.PORT || 4000;
      server
        .listen(PORT)
        .on('listening', () => {
          console.log(`Server is running on port ${PORT}`);
          resolve(true);
        })
        .on('error', (error) => {
          console.log(`Error: ${error}`);
          reject(false);
        });
    });
  }
}
