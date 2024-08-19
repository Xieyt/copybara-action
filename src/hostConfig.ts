import { ensureFile, writeFile } from "fs-extra";
import { homedir } from "os";

export class hostConfig {
  static gitConfigPath = homedir() + "/.gitconfig";
  static gitCredentialsPath = homedir() + "/.git-credentials";
  static sshKeyPath = homedir() + "/.ssh/id_rsa";
  static knownHostsPath = homedir() + "/.ssh/known_hosts";
  static cbConfigPath = homedir() + "/copy.bara.sky";

  static async getGithubKnownHost(): Promise<string> {
    try {
      const { stdout } = await execAsync("ssh-keyscan github.com");
      return stdout.trim();
    } catch (error) {
      console.error("Error fetching GitHub known host:", error);
      throw error;
    }
  }

  static async saveCommitter(committer: string): Promise<void> {
    const match = committer.match(/^(.+)\s?<([^>]+)>/i);
    const committerName = match && match[1] ? match[1].trim() : "Github Actions";
    const committerEmail = match && match[2] ? match[2].trim() : "actions@github.com";

    return this.save(
      this.gitConfigPath,
      `
      [user]
          name = ${committerName}
          email = ${committerEmail}
      `
    );
  }

  static async saveAccessToken(accessToken: string): Promise<void> {
    return this.save(this.gitCredentialsPath, `https://user:${accessToken}@github.com`);
  }

  static async saveSshKey(sshKey: string): Promise<void> {
    return this.save(this.sshKeyPath, sshKey);
  }

  static async saveKnownHosts(knownHosts: string): Promise<void> {
    return this.save(this.knownHostsPath, `${this.githubKnownHost}\n${knownHosts}`);
  }

  static async saveCopybaraConfig(config: string): Promise<void> {
    return this.save(this.cbConfigPath, config);
  }

  static async save(file: string, content: string): Promise<void> {
    const filePath = file.replace("~", homedir());
    return ensureFile(filePath).then(() => writeFile(filePath, content));
  }
}
