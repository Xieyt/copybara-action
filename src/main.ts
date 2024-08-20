import * as core from "@actions/core";
import { CopybaraAction } from "./copybaraAction";
import { exit } from "./exit";

// Helper function to get input from core.getInput or process.env
function getInput(name: string, options?: core.InputOptions): any {
  // Check environment variable first (both lowercase and uppercase)
  const envValue = process.env[name] || process.env[name.toUpperCase()];
  console.log(`env -> ${name}:${envValue}`);

  if (envValue !== undefined) {
    return envValue;
  }

  // Fallback to core.getInput
  try {
    return core.getInput(name, options);
  } catch (error) {
    if (options?.required) {
      throw new Error(`Input required and not supplied: ${name}`);
    }
    return undefined;
  }
}

const action = new CopybaraAction({
  // Credentials
  sshKey: getInput("ssh_key", { required: true }),
  accessToken: getInput("access_token"),

  // Common config
  sot: {
    repo: getInput("sot_repo"),
    branch: getInput("sot_branch"),
  },
  destination: {
    repo: getInput("destination_repo"),
    branch: getInput("destination_branch"),
  },
  committer: getInput("committer"),

  // Push config
  push: {
    include: getInput("push_include").split(" "),
    exclude: getInput("push_exclude").split(" "),
    move: getInput("push_move").split(/\r?\n/),
    replace: getInput("push_replace").split(/\r?\n/),
  },

  // PR config
  pr: {
    include: getInput("pr_include").split(" "),
    exclude: getInput("pr_exclude").split(" "),
    move: getInput("pr_move").split(/\r?\n/),
    replace: getInput("pr_replace").split(/\r?\n/),
  },

  // Advanced config
  customConfig: getInput("custom_config"),
  workflow: getInput("workflow"),
  copybaraOptions: getInput("copybara_options").split(" "),
  knownHosts: getInput("ssh_known_hosts"),
  prNumber: getInput("pr_number"),
  createRepo: getInput("create_repo") == "yes" ? true : false,

  // Docker
  image: {
    name: getInput("copybara_image"),
    tag: getInput("copybara_image_tag"),
  },
});

if (!core.isDebug()) {
  // Action fails gracefully on 'throw'
  process.on("unhandledRejection", (err) => exit(53, err as string));
  action.run().then(exit).catch(exit);
} else {
  core.debug("BEWARE: Debug mode is on, this could result in this action succeeding while it didn't. Check the logs.");
  action.run().then(exit);
}
