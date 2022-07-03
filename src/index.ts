import express, { Application, Request, Response } from "express";
import { CloudTasksClient } from "@google-cloud/tasks";
import { google } from "@google-cloud/tasks/build/protos/protos";
import ICreateTaskRequest = google.cloud.tasks.v2.ICreateTaskRequest;
import Task = google.cloud.tasks.v2.Task;

// sample-metadata:
//   title: Cloud Tasks Create HTTP Target
//   description: Create Cloud Tasks with an HTTP Target

/**
 * Create a task with an HTTP target for a given queue with an arbitrary payload.
 */
async function kick(): Promise<void> {
  // [START cloud_tasks_create_http_task]
  // Instantiates a client.
  const client = new CloudTasksClient();

  const createHttpTask = async (): Promise<void> => {
    const project = "line-bot-353103"; // Your GCP Project id
    const queue = "my-queue"; // Name of your Queue
    const location = "asia-northeast2"; // The GCP region of your queue
    const url = "https://line-bot-4vbqfq4cja-dt.a.run.app/sendLineMessage"; // The full url path that the request will be sent to
    const payload = "Hello, World!"; // The task HTTP request body
    const inSeconds = 0; // Delay in task execution

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task: Task = Task.create({
      httpRequest: {
        httpMethod: "POST",
        url: url,
      },
    });

    if (payload && task.httpRequest) {
      task.httpRequest.body = Buffer.from(payload).toString("base64");
    }

    task.scheduleTime = {
      seconds: inSeconds + Date.now() / 1000,
    };

    // Send create task request.
    console.log("Sending task:");
    console.log(task);
    const request: ICreateTaskRequest = {
      parent: parent,
      task: task,
    };
    const [response] = await client.createTask(request);
    const name = response.name;
    if (name === null || name === undefined) {
      console.log("Created task name is null or undefined");
    } else {
      console.log(`Created task ${name}`);
    }
  };

  await createHttpTask();
  // [END cloud_tasks_create_http_task]
}

const app: Application = express();

app.get("/kick", (_req: Request, res: Response) => {
  kick().then(() => {
    console.log("createHttpTask() completed.");
  }).catch((reason) => {
    console.log("createHttpTask() error.");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    console.log(reason.toString());

    return res.status(500).send();
  })

  return res.status(200).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
