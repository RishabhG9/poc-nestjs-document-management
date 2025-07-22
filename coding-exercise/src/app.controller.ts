import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as marked from 'marked';

@Controller()
export class AppController {
  @Get('/')
  getReadme(@Res() res: Response) {
    const readmePath = path.join(__dirname, '..', 'README.md');
    const markdown = fs.readFileSync(readmePath, 'utf8');
    const html = marked.parse(markdown);
    res.setHeader('Content-Type', 'text/html');
    return res.send(`
      <html>
        <head>
          <title>POC API - Documentation</title>
        </head>
        <body style="padding: 40px; font-family: Arial">
          ${html}
        </body>
      </html>
    `);
  }
}