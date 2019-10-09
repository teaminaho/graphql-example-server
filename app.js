import express from "express";
import graphqlHTTP from "express-graphql";
import { buildSchema } from "graphql";
import FakeProgress from "fake-progress";

const progress = new FakeProgress({
  timeConstant: 60 * 1000,
  autoStart: false
});
setInterval(() => {
  if (progress.progress > 0.98) {
    progress.end();
  }
}, 1000);

const schema = buildSchema(`
  type Message {
    result: Boolean!
    error: String
  }
  type Query {
    progress: Float!
  }
  type Mutation {
    cmd(input: String!): Message!
  }
`);

const root = {
  progress: () => {
    return progress.progress;
  },
  cmd: ({ input }) => {
    switch (input) {
      case "start":
        progress.start();
        return { result: true };

      case "cancel":
        progress.stop();
        progress.setProgress(0);
        return { result: true };

      default:
        return { result: false, error: "Invalid argument" };
    }
  }
};

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);
app.listen(4000, () => {
  console.log("Now browse to localhost:4000/graphql");
});
