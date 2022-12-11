import jwt from 'jsonwebtoken';

interface TokenData {
    [key: string]: any
};

export default class TokenHelper {
    public generateToken(data: TokenData) {
        const token = jwt.sign(data, process.env.JWT_TOKEN || 'secret-token');
        return token;
    }

    public decodeToken(token: string) {
        try {
            return jwt.verify(token, process.env.JWT_TOKEN || 'secret-token');
        } catch (err) {
            throw err;
        }
    }
}