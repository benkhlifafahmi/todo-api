import request from 'supertest';
import createServer from '@app/server';
import { Prisma, PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { userData, userTwoData } from '@test/data/user';
import TokenHelper from '@app/helpers/token.helper';
import jwt, {JwtPayload} from 'jsonwebtoken';
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

function generateFakeToken(id: number) {
    const token = jwt.sign({ id }, 'wrong secret key here', { expiresIn: '90d' });
    return token;
};

function generateExpiredToken(id: number) {
    const token = jwt.sign({ id }, process.env.JWT_TOKEN || 'secret-token', { expiresIn: '1' });
    return token;
}

const tokenHelper = new TokenHelper();
let tokenUserOne: string,
    tokenUserTwo: string,
    expiredToken: string,
    fakeToken: string,
    taskId: number;

describe('[*] Tasks Management test.', function () {
    this.beforeAll((done) => {
        (async () => {
            try {
                await prisma.task.deleteMany({
                    where: {},
                });
                // delete all user.
                await prisma.user.deleteMany({
                    where: {}
                });
                // create two users.
                const u1 = await prisma.user.create({
                    data: userData,
                    select: {
                        id: true,
                    },
                });
                const u2 = await prisma.user.create({
                    data: userTwoData,
                    select: {
                        id: true,
                    }
                });
                // generate token for both users.
                tokenUserOne = tokenHelper.generateToken({ id: u1.id });
                expiredToken = generateExpiredToken(u1.id);
                fakeToken = generateFakeToken(u1.id);
                tokenUserTwo = tokenHelper.generateToken({ id: u2.id });
            } catch (err) {
                console.log(err);
            }
        })()
            .then(() => done())
            .catch(() => done());
    });
    // LIST tasks test cases.
    it('GET /tasks without providing token should return 401.', (done) => {
        request(app)
            .get('/tasks')
            .expect(401, done);
    });
    it('GET /tasks with providing fake token should return 401.', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', fakeToken)
            .expect(401, done);
    });
    it('GET /tasks with providing expired token should return 401.', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', expiredToken)
            .expect(401, done);
    });
    it('GET /tasks with providing the right token should return empty task for the user #1.', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response?.body).to.have.a.property('success').equals(true);
                expect(response?.body).to.have.a.property('data');
                expect(response?.body?.data).length.is.empty;
                done();
            })
            .catch(done);
    });

    // Crate a task test cases.
    it('POST /tasks without providing the user token should return 401.', (done) => {
        request(app)
            .post('/tasks')
            .send({})
            .expect(401, done);
    });
    it('POST /tasks with providing expired token should return 401.', (done) => {
        request(app)
            .post('/tasks')
            .set('x-api-key', expiredToken)
            .send({})
            .expect(401, done);
    });
    it('POST /tasks without providing the task title should raise a 400 badrequest error.', (done) => {
        request(app)
            .post('/tasks')
            .set('x-api-key', tokenUserOne)
            .send({})
            .expect(400, done);
    });
    it('POST /tasks with the right data should create a new task assigned to the authenticated user (201 response).', (done) => {
        request(app)
            .post('/tasks')
            .set('x-api-key', tokenUserOne)
            .send({ title: 'My First Task!' })
            .expect(201)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.task).to.have.a.property('id');
                taskId = response.body?.task?.id;
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=true should return zero completed task (no task is completed yet).', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.data?.length).eq(0);
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=false should return one incompleted task by the user (task is not done yet as it was just created).', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.data?.length).eq(1);
                done();
            })
            .catch(done);
    });


    // Update a specific task test cases.
    it('PUT /tasks/:id without providing the user token should return 401.', (done) => {
        request(app)
            .put(`/tasks/${taskId}`)
            .expect(401, done);
    });
    it('PUT /tasks/:id with providing expired token should return 401.', (done) => {
        request(app)
            .put(`/tasks/${taskId}`)
            .set('x-api-key', expiredToken)
            .expect(401, done);
    });
    it('PUT /tasks/:id should return 404 when resource does not exist.', (done) => {
        request(app)
            .put(`/tasks/0`)
            .set('x-api-key', tokenUserOne)
            .send({ completed: false })
            .expect(404, done);
    });
    it('PUT /tasks/:id without providing the completed value should raise a 400 badrequest error.', (done) => {
        request(app)
            .put(`/tasks/${taskId}`)
            .set('x-api-key', tokenUserOne)
            .send({})
            .expect(400, done);
    });
    it('PUT /tasks/:id with the right data should update the task completed status.', (done) => {
        request(app)
            .put(`/tasks/${taskId}`)
            .set('x-api-key', tokenUserOne)
            .send({ completed: true })
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.property('success').to.be.true;
                expect(response.body).to.have.property('task').to.have.property('id').eq(taskId);
                expect(response.body).to.have.property('task').to.have.property('completed').to.be.true;
                done();
            })
            .catch(done);
    });
    it('PUT /tasks/:id with the right data should update the task completed status.', (done) => {
        request(app)
            .put(`/tasks/${taskId}`)
            .set('x-api-key', tokenUserOne)
            .send({ title: 'The title was just updated' })
            .then((response) => {
                expect(response.body).to.have.property('success').to.be.true;
                expect(response.body).to.have.property('task').to.have.property('id').eq(taskId);
                expect(response.body).to.have.property('task').to.have.property('title').to.be('The title was just updated');
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=true should return one completed task by the user (task has been set to completed)..', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.data?.length).eq(1);
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=false should return empty incompleted task by the user (task has been set to completed).', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.data?.length).eq(0);
                done();
            })
            .catch(done);
    });


    // Delete a specific task test cases.
    it('DELETE /tasks/:id without providing the user token should return 401.', (done) => {
        request(app)
            .delete(`/tasks/${taskId}`)
            .expect(401, done);
    });
    it('DELETE /tasks/:id with providing expired token should return 401.', (done) => {
        request(app)
            .delete(`/tasks/${taskId}`)
            .set('x-api-key', expiredToken)
            .expect(401, done);
    });
    it('DELETE /tasks/:id should return 404 when resource does not exist.', (done) => {
        request(app)
            .delete(`/tasks/0`)
            .set('x-api-key', tokenUserOne)
            .expect(404, done);
    });
    it('DELETE /tasks/:id should return 401 when the resource exist, but it`s not owned by the connected user.', (done) => {
        const userId = (jwt.verify(tokenUserTwo, process.env.JWT_TOKEN || 'secret-token') as JwtPayload).id;
        prisma.task.create({
            data: {
                userId,
                title: 'Access permission test',
                completed: false,
            },
            select: {
                id: true
            }
        })
            .then((task) => {
                request(app)
                    .delete(`/tasks/${task.id}`)
                    .set('x-api-key', tokenUserOne)
                    .expect(401, done);
            })
            .catch(() => done());
    });
    it('DELETE /tasks/:id should return 200 when the resource exist and has been removed.', (done) => {
        request(app)
            .delete(`/tasks/${taskId}`)
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.property('success').eq(true);
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=true should return empty completed task (task has been removed during previous test cases.).', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('task');
                expect(response.body.data?.length).eq(0);
                done();
            })
            .catch(done);
    });
    it('GET /tasks?completed=false should return empty incompleted task by the user.', (done) => {
        request(app)
            .get('/tasks')
            .set('x-api-key', tokenUserOne)
            .expect(200)
            .then((response) => {
                expect(response.body).to.have.a.property('success').equals(true);
                expect(response.body).to.have.a.property('data');
                expect(response.body.data?.length).eq(0);
                done();
            })
            .catch(done);
    });
    this.afterAll(function (done) {
        prisma.task.deleteMany({
            where: {}
        })
        .then(() => done())
        .catch(() => done());
    });
});