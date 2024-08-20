import { ensureFile, writeFile } from "fs-extra";
import * as core from "@actions/core";
import { homedir } from "os";
import { exec } from "child_process";
import { promisify } from "util";
import { chmod } from "fs/promises";

const execAsync = promisify(exec);

export class hostConfig {
  static gitConfigPath = homedir() + "/.gitconfig";
  static gitCredentialsPath = homedir() + "/.git-credentials";
  static sshKeyPath = homedir() + "/.ssh/id_rsa";
  static knownHostsPath = homedir() + "/.ssh/known_hosts";
  static cbConfigPath = homedir() + "/copy.bara.sky";

  static async getGithubKnownHost(): Promise<string> {
    try {
      const { stdout } = await execAsync("ssh-keyscan github.com");
      return stdout;
      //return stdout.trim();
    } catch (error) {
      console.error("Error fetching GitHub known host:", error);
      throw error;
    }
  }

  static async saveCommitter(committer: string): Promise<void> {
    const match = committer.match(/^(.+?)\s*<(.+)>$/i);
    const committerName = match && match[1] ? match[1].trim() : "Github Actions";
    const committerEmail = match && match[2] ? match[2].trim() : "actions@github.com";

    //core.debug(committerEmail);

    await this.save(
      this.gitConfigPath,
      `
      [user]
          name = ${committerName}
          email = ${committerEmail}
      `
    );
  }

  static async saveAccessToken(accessToken: string): Promise<void> {
    await this.save(this.gitCredentialsPath, `https://user:${accessToken}@github.com`);
  }

  // TODO: Fix This
  // The error is issue with libcrypto and for now I have used another job to fix it in workflow
  static async saveSshKey(sshKey: string): Promise<void> {
    // var sshKeys = sshKey.split(" ");
    // var ssh = [sshKeys.slice(0, 4).join(" "), ...sshKeys.slice(4, -4), sshKeys.slice(-4).join(" ")];
    // var sshK = ssh.join("\n") + "\n";
    // console.log(sshK);
    await this.save(this.sshKeyPath, sshKey);
    // console.log(sshKeys[4:].join("\n"));
    await chmod(this.sshKeyPath, 0o600); // Change file permissions to 0600
  }

  static async saveKnownHosts(knownHosts: string): Promise<void> {
    const githubKnownHost = await this.getGithubKnownHost();
    await this.save(this.knownHostsPath, `${githubKnownHost}`);
  }

  static async saveCopybaraConfig(config: string): Promise<void> {
    await this.save(this.cbConfigPath, config);
  }

  static async save(file: string, content: string): Promise<void> {
    core.debug(`Saving file: ${file}`);
    //core.debug(`content: ${content}`);

    const filePath = file.replace("~", homedir());
    await ensureFile(filePath);
    await writeFile(filePath, content);
  }

  //static async save(file: string, content: string): Promise<void> {
  // const filePath = file.replace("~", homedir());
  // await ensureFile(filePath).then(() => writeFile(filePath, content));
  // }
}
