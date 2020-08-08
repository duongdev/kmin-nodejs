const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.mock("../../middlewares/auth");
const authMiddlewares = require("../../middlewares/auth");

describe("/users", () => {
  let connection;
  beforeAll(async () => {
    const mongod = new MongoMemoryServer();
    const uri = await mongod.getUri();
    console.log(uri);
    connection = (
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    ).connection;
    // console.log("connected");
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("GET /users/me", () => {
    it("should return Unauthorized if no token is provided", async () => {
      authMiddlewares.parseToken.mockImplementationOnce((req, res, next) => {
        next();
      });
      authMiddlewares.requiresUser.mockImplementationOnce((req, res, next) => {
        res.status(403).json({ message: "Unauthorized" });
      });
      const res = await request(app).get("/users/me");
      expect(res.body.message).toBe("Unauthorized");
    });

    it(`should return the correct user with token`, async () => {
      const user = {
        _id: "5f18317cc73bf02c73d7ef77",
        email: "vijimu@dugokfi.nf",
        password:
          "$2b$10$wYOexvWzU8GF4o7A2mwQbOIdmPiKIHjrv48h/p71RndxEkYk1x7pu",
        displayName: "Ellen Martin",
        createdAt: "2020-07-22T12:30:52.104Z",
        __v: 0,
        avatar: "ac828c2788bfce2ce215e2081fbc1176",
      };

      authMiddlewares.parseToken.mockImplementation((req, res, next) => {
        next();
      });
      authMiddlewares.requiresUser.mockImplementationOnce((req, res, next) => {
        req.user = user;

        return next();
      });

      const res = await request(app).get("/users/me");

      expect(res.body).toMatchObject(user);
    });
  });

  describe.only("POST /users", () => {
    it("should return correct user", async () => {
      authMiddlewares.parseToken.mockImplementationOnce((req, res, next) => {
        next();
        //
      });
      const { body } = await request(app).post("/users").send({
        email: "user@example.com",
        password: "123456",
        displayName: "Harry Potter",
      });
      expect(body).toMatchObject({
        email: "user@example.com",
        displayName: "Harry Potter",
      });
    });
    it("should return correct user 2", async () => {
      authMiddlewares.parseToken.mockImplementationOnce((req, res, next) => {
        next();
      });
      const { body } = await request(app).post("/users").send({
        email: "user@example.com",
        password: "123456",
        displayName: "Harry Potter",
      });

      expect(body).toMatchObject({
        email: "user@example.com",
        displayName: "Harry Potter",
        password: expect.any(String),
        createdAt: expect.any(String),
      });
    });
  });
});
