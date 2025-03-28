class GitHubAdvancedExtension {
  constructor(runtime) {
    this.runtime = runtime;
    this.authToken = '';
  }

  getInfo() {
    return {
      id: 'githubAdvanced',
      name: 'GitHub Advanced',
      blocks: [
        {
          opcode: 'setToken',
          blockType: Scratch.BlockType.COMMAND,
          text: 'set GitHub token to [TOKEN]',
          arguments: {
            TOKEN: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: ''
            }
          }
        },
        {
          opcode: 'getFileContent',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get content of [REPO]/[PATH]',
          arguments: {
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            }
          }
        },
        {
          opcode: 'getLineFromFile',
          blockType: Scratch.BlockType.REPORTER,
          text: 'get line [LINE] from [REPO]/[PATH]',
          arguments: {
            LINE: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            },
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            }
          }
        },
        {
          opcode: 'updateFile',
          blockType: Scratch.BlockType.COMMAND,
          text: 'update file [REPO]/[PATH] with content [CONTENT] commit message [MESSAGE]',
          arguments: {
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            },
            CONTENT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Hello World!'
            },
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Update from Scratch'
            }
          }
        },
        {
          opcode: 'updateLineInFile',
          blockType: Scratch.BlockType.COMMAND,
          text: 'update line [LINE] in [REPO]/[PATH] to [NEW_CONTENT] commit message [MESSAGE]',
          arguments: {
            LINE: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            },
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            },
            NEW_CONTENT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'New line content'
            },
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Update line from Scratch'
            }
          }
        },
        {
          opcode: 'insertLineInFile',
          blockType: Scratch.BlockType.COMMAND,
          text: 'insert at line [LINE] in [REPO]/[PATH] content [NEW_CONTENT] commit message [MESSAGE]',
          arguments: {
            LINE: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            },
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            },
            NEW_CONTENT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'New line content'
            },
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Insert line from Scratch'
            }
          }
        },
        {
          opcode: 'deleteLineFromFile',
          blockType: Scratch.BlockType.COMMAND,
          text: 'delete line [LINE] from [REPO]/[PATH] commit message [MESSAGE]',
          arguments: {
            LINE: {
              type: Scratch.ArgumentType.NUMBER,
              defaultValue: 1
            },
            REPO: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'username/repo'
            },
            PATH: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'file.txt'
            },
            MESSAGE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'Delete line from Scratch'
            }
          }
        }
      ],
      menus: {
        // Можно добавить меню при необходимости
      }
    };
  }

  setToken(args) {
    this.authToken = args.TOKEN;
  }

  async getFile(args) {
    if (!this.authToken) {
      console.error('GitHub token not set');
      return '';
    }

    const repo = args.REPO;
    const path = args.PATH;

    try {
      const url = `https://api.github.com/repos/${repo}/contents/${path}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.authToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const fileData = await response.json();
      return atob(fileData.content);
    } catch (error) {
      console.error('Error getting file:', error);
      return '';
    }
  }

  async getFileContent(args) {
    return await this.getFile(args);
  }

  async getLineFromFile(args) {
    const content = await this.getFile(args);
    const lines = content.split('\n');
    const lineNumber = Math.max(1, Math.min(lines.length, args.LINE)) - 1;
    
    return lines[lineNumber] || '';
  }

  async updateFile(args) {
    if (!this.authToken) {
      console.error('GitHub token not set');
      return;
    }

    const repo = args.REPO;
    const path = args.PATH;
    const content = args.CONTENT;
    const message = args.MESSAGE;

    try {
      // 1. Get the current SHA of the file
      const getUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
      const getResponse = await fetch(getUrl, {
        headers: {
          'Authorization': `token ${this.authToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      let sha = '';
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }

      // 2. Update the file
      const updateUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.authToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: sha || undefined
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      console.log('File updated successfully');
    } catch (error) {
      console.error('Error updating file:', error);
    }
  }

  async modifyFileLines(args, modificationCallback) {
    if (!this.authToken) {
      console.error('GitHub token not set');
      return;
    }

    const repo = args.REPO;
    const path = args.PATH;
    const message = args.MESSAGE;

    try {
      // 1. Get the current file content
      const content = await this.getFile(args);
      let lines = content.split('\n');
      
      // 2. Modify the lines
      lines = modificationCallback(lines);
      
      // 3. Update the file
      await this.updateFile({
        REPO: repo,
        PATH: path,
        CONTENT: lines.join('\n'),
        MESSAGE: message
      });
    } catch (error) {
      console.error('Error modifying file lines:', error);
    }
  }

  async updateLineInFile(args) {
    const lineNumber = args.LINE - 1;
    const newContent = args.NEW_CONTENT;
    
    await this.modifyFileLines(args, (lines) => {
      if (lineNumber >= 0 && lineNumber < lines.length) {
        lines[lineNumber] = newContent;
      }
      return lines;
    });
  }

  async insertLineInFile(args) {
    const lineNumber = args.LINE - 1;
    const newContent = args.NEW_CONTENT;
    
    await this.modifyFileLines(args, (lines) => {
      if (lineNumber >= 0 && lineNumber <= lines.length) {
        lines.splice(lineNumber, 0, newContent);
      }
      return lines;
    });
  }

  async deleteLineFromFile(args) {
    const lineNumber = args.LINE - 1;
    
    await this.modifyFileLines(args, (lines) => {
      if (lineNumber >= 0 && lineNumber < lines.length) {
        lines.splice(lineNumber, 1);
      }
      return lines;
    });
  }
}

Scratch.extensions.register(new GitHubAdvancedExtension());
