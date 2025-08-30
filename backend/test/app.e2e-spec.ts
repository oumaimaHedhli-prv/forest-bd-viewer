/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Forest BD Viewer E2E', () => {
  let app: INestApplication;
  let httpServer: any;
  let jwtToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new user', async () => {
    const res = await request(httpServer).post('/graphql').send({
      query: `mutation { createUser(input: { email: "\\test-e2e@forest.fr\\", password: \\"test1234\\" }) { id email } }`,
    });
    expect(res.body.data.createUser.email).toBe('test-e2e@forest.fr');
    userId = res.body.data.createUser.id;
  });

  it('should login and return JWT', async () => {
    const res = await request(httpServer).post('/graphql').send({
      query: `mutation { login(email: \\"test-e2e@forest.fr\\", password: \\"test1234\\") { access_token } }`,
    });
    expect(res.body.data.login.access_token).toBeDefined();
    jwtToken = res.body.data.login.access_token;
  });

  it('should save map state for user', async () => {
    const res = await request(httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `mutation { saveMapState(mapPosition: { lat: 48.85, lng: 2.35 }, mapZoom: 10, mapFilters: { species: \\"chene\\" }) }`,
      });
    expect(res.body.data.saveMapState).toBe(true);
  });

  it('should get map state for user', async () => {
    const res = await request(httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `query { getMapState { id mapPosition mapZoom mapFilters } }`,
      });
    expect(res.body.data.getMapState).toBeDefined();
    expect(res.body.data.getMapState.mapZoom).toBe(10);
  });

  it('should fetch forest data', async () => {
    const res = await request(httpServer)
      .post('/graphql')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({
        query: `query { forests { id name species } }`,
      });
    expect(res.body.data.forests).toBeDefined();
    // Optionally check for at least one forest entry
  });
});
