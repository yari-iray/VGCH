import path from 'path';
import fs from 'fs';
import { Token } from './model';

const tokensPath = path.join(process.cwd(), 'tokens.json');
const tokensExists = fs.existsSync(tokensPath);

class TokenHandler {
  private tokens: Token[] = [];

  constructor() {
    this.loadTokens();
  }

  private loadTokens() {
    try {
      if (tokensExists) {
        const fileContent = fs.readFileSync(tokensPath, 'utf-8');
        this.tokens = JSON.parse(fileContent).tokens.map((x: any) => ({
          Value: x.Value,
          Expiration: new Date(x.Expiration),
          IsValid: x.IsValid,
          Level: x.Level
        }));
      }
    } catch (err) {
      console.error('Error reading tokens.json:', err);
      this.tokens = [];
    }
  }

  private saveTokens() {
    try {
      if (tokensExists) {
        fs.writeFileSync(tokensPath, JSON.stringify({ tokens: this.tokens.map(x => ({
          Value: x.Value,
          Expiration: x.Expiration.toISOString(),
          IsValid: x.IsValid,
          Level: x.Level
        })) }, null, 2));
      }
    } catch (err) {
      console.error('Error writing tokens.json:', err);
    }
  }

  public getTokens(): Token[] {
    return this.tokens;
  }

  public findToken(value: string | undefined): Token | undefined {
    return this.tokens.find(x => x.Value === value);
  }

  public addToken(token: Token): void {
    this.tokens.push(token);
    this.saveTokens();
  }

  public reload(): void {
    this.loadTokens();
  }
}

export const tokenHandler = new TokenHandler();
