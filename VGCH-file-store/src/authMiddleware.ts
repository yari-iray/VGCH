import { tokenHandler } from './tokenhandler';
import { Request, Response, NextFunction } from 'express';

export const authorize = (requiredLevel: 'admin' | 'user' | undefined) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    // Use tokenHandler to find token
    const foundToken = tokenHandler.findToken(token);

    if (!foundToken) {
      res.status(401).json({ message: "Token not found" });
      return;
    }

    if (!foundToken.IsValid || foundToken.Expiration.getTime() < Date.now()) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    if ((requiredLevel === "admin" && foundToken.Level !== "admin") || (requiredLevel === "user" && !foundToken.Level)) {
      res.status(403).json({ message: "Token invalid for operation" });
      return;
    }

    // attach level to request
    (req as any).userLevel = foundToken.Level;
    next();
  };
};