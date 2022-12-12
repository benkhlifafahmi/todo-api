import request from 'supertest';
import createServer from '@app/server';
import { Prisma, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { userData } from '@test/data/user';
import { expect } from 'chai';

dotenv.config();
const app = createServer();

const prisma: PrismaClient<
    Prisma.PrismaClientOptions,
    never,
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
> = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL
        }
    }
});

describe('[*] User Authentication test.', function () {
    this.beforeAll(function (done) {
        prisma.user.deleteMany({
            where: {}
        })
            .then(() => {
                done();
            })
            .catch((e) => {
                console.log(`[ERROR] error prisma ${e}`);
                done();
            });
    });
    it('GET /auth/singin should return 404', (done) => {
        request(app).get('/auth/singin').expect(404, done);
    });
    it('POST /auth/singin should return 401 when user information are invalid.', (done) => {
        request(app)
            .post('/auth/signin')
            .send({
                email: userData.email,
                password: userData.password,
            })
            .expect(401, done);
    });
    it('GET /auth/signup should return 404', (done) => {
        request(app).get('/auth/singin').expect(404, done);
    });
    it('POST /auth/signup should raise an error when sending missing user information', (done) => {
        request(app)
            .post('/auth/signup')
            .send({
                email: userData.email,
            })
            .expect(500, done);
    });
    it('POST /auth/signup should raise an error when sending invalid (format) user information', (done) => {
        request(app)
            .post('/auth/signup')
            .send({
                email: userData.name,
                password: userData.password,
            })
            .expect(400, done);
    });
    it('POST /auth/signup should return 200 when sending valid user information', (done) => {
        request(app)
            .post('/auth/signup')
            .send({
                email: userData.email,
                password: userData.password,
                name: userData.name,
            })
            .expect(200, done);
    });
    it('POST /auth/signup should raise an error when trying to signup with an already exisitng user information', (done) => {
        request(app)
            .post('/auth/signup')
            .send({
                email: userData.email,
                password: userData.password,
            })
            .expect(401, done);
    });
    it('POST /auth/singin should return 200 when user information are valid and give us a token.', async () => {
        return request(app)
            .post('/auth/signin')
            .send({
                email: userData.email,
                password: userData.password,
            })
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('token');
                expect(response.body?.user).to.have.a.property('id');
                expect(response.body?.user).to.have.a.property('email').equal(userData.email);
                expect(response.body?.user).to.have.a.property('name').equal(userData.name);
            });
    });
    this.afterAll(function (done) {
        prisma.user.deleteMany({
            where: {}
        })
            .then(() => {
                done();
            })
            .catch((e) => {
                console.log(`[ERROR] error prisma ${e}`);
                done();
            });
    });
});