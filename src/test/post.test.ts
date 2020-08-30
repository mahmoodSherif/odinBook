import request from "supertest";
import app from "../app";
import Post from "../models/post";
import {
  createUserAndGetToken,
  createPost,
  createUser,
  createFriend,
  getToken,
  clearDataBase,
} from "./helper/helper";
import { expectPosts, expectPost } from "./helper/expect";
import { generatePost } from "./helper/generators";
import { connect } from "../dbConfigs/testing";
import { invalidId } from "./helper/testData";
import * as POST_ERRORS from "../errorCodes";

beforeAll(connect);

afterEach(clearDataBase);

describe("get current user feed GET /feed", () => {
  it("200 OK", async () => {
    const { user, token } = await createUserAndGetToken();
    const friend = await createFriend(user);
    const posts = [
      await createPost(friend),
      await createPost(friend),
      await createPost(friend),
    ];
    const res = await request(app)
      .get("/feed/")
      .set("Authorization", "Bearer " + token)
      .expect(200);
    expectPosts(res.body, posts);
  });

  it("no auth ", async () => {
    await request(app).get("/feed/").expect(401);
  });
});

describe("get user posts GET /user/{id}/posts", () => {
  it("200 OK", async () => {
    const { user, token } = await createUserAndGetToken();
    const posts = [
      await createPost(user),
      await createPost(user),
      await createPost(user),
    ];
    const res = await request(app)
      .get("/users/" + user._id + "/posts/")
      .set("Authorization", "Bearer " + token)
      .expect(200);
    expectPosts(res.body, posts);
  });

  it("no auth ", async () => {
    const user = await createUser();
    await request(app)
      .get("/users/" + user._id + "/posts/")
      .expect(401);
  });

  it("invalid id", async () => {
    await request(app)
      .get("/users/" + invalidId + "/posts/")
      .set("Authorization", "Bearer " + (await getToken()))
      .expect(404);
  });
});

describe("show post GET /posts/postId", () => {
  it("200 OK", async () => {
    const { user, token } = await createUserAndGetToken();
    const post = await createPost(user);
    const res = await request(app)
      .get("/posts/" + post._id)
      .set("Authorization", "Bearer " + token)
      .expect(200);
    expectPost(res.body, post);
  });

  it("no auth", async () => {
    const user = await createUser();
    const post = await createPost(user);
    await request(app)
      .get("/posts/" + post._id)
      .expect(401);
  });
});

describe("create post POST /posts", () => {
  it("200 OK", async () => {
    const { user, token } = await createUserAndGetToken();
    const postData = generatePost();
    const res = await request(app)
      .post("/posts/")
      .send(postData)
      .set("Authorization", "Bearer " + token)
      .expect(200);
    // check db
    const dbPost = await Post.findById(res.body._id)
      .populate("user", "name email photoUrl")
      .exec();
    expectPost(dbPost, { ...postData, user });
  });

  it("no auth", async () => {
    await request(app)
      .post("/posts/")
      .send(await generatePost())
      .expect(401);
  });

  it("without type and text", async () => {
    await request(app)
      .post("/posts/")
      .send(
        generatePost({
          type: undefined,
          text: undefined,
        })
      )
      .set("Authorization", "Bearer " + (await getToken()))
      .expect(400)
      .expect({
        errors: [POST_ERRORS.MISSING_TYPE, POST_ERRORS.MISSING_TEXT],
      });
  });

  it("invalid type and text", async () => {
    await request(app)
      .post("/posts/")
      .send(
        generatePost({
          type: " oh yah",
          text: "",
        })
      )
      .set("Authorization", "Bearer " + (await getToken()))
      .expect(400)
      .expect({
        errors: [POST_ERRORS.INVALID_TYPE, POST_ERRORS.EMPTY_TEXT],
      });
  });
});
