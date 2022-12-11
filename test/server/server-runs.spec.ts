import request from 'supertest';
import { expect } from "chai";

import createServer from '@app/server';
const app = createServer();

describe('Server checks', function() {
    it('server is created without any error', function(done) {
        request(app).get('/').expect(200, done);
    });
});