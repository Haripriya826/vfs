class File {
  constructor(name, content = "") {
    this.name = name;
    this.content = content;
  }
}

class Directory {
  constructor(name) {
    this.name = name;
    this.subdirs = {};
    this.files = {};
  }
}

class FileSystem {
  constructor() {
    this.root = new Directory("root");
    this.current = this.root;
    this.path = ["root"];
  }

  mkdir(name) {
    if (this.current.subdirs[name]) {
      return `Directory '${name}' already exists.`;
    } else {
      this.current.subdirs[name] = new Directory(name);
      return `Directory '${name}' created.`;
    }
  }

  cd(name) {
    if (name === "..") {
      if (this.path.length > 1) {
        this.path.pop();
        this.current = this.root;
        for (let folder of this.path.slice(1)) {
          this.current = this.current.subdirs[folder];
        }
        return "";
      } else {
        return "Already at root.";
      }
    } else if (this.current.subdirs[name]) {
      this.current = this.current.subdirs[name];
      this.path.push(name);
      return "";
    } else {
      return `No such directory: ${name}`;
    }
  }

  ls() {
    return `Directories: ${Object.keys(this.current.subdirs).join(" ") || "(none)"}\nFiles: ${Object.keys(this.current.files).join(" ") || "(none)"}`;
  }

  pwd() {
    return "/" + this.path.join("/");
  }

  create(name) {
    if (this.current.files[name]) {
      return `File '${name}' already exists.`;
    } else {
      this.current.files[name] = new File(name);
      return `File '${name}' created.`;
    }
  }

  write(name, content) {
    if (this.current.files[name]) {
      this.current.files[name].content = content;
      return `Written to file '${name}'.`;
    } else {
      return `File '${name}' not found.`;
    }
  }

  read(name) {
    if (this.current.files[name]) {
      return `Content of '${name}': ${this.current.files[name].content}`;
    } else {
      return `File '${name}' not found.`;
    }
  }
}

const terminal = document.getElementById("terminal");
const fs = new FileSystem();

function print(text, className = "output") {
  const line = document.createElement("div");
  line.className = className;
  line.textContent = text;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

function promptInput() {
  const line = document.createElement("div");
  line.className = "command-line";
  const prompt = document.createElement("span");
  prompt.className = "prompt";
  prompt.textContent = fs.pwd() + " $ ";
  const input = document.createElement("input");

  line.appendChild(prompt);
  line.appendChild(input);
  terminal.appendChild(line);

  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const command = input.value.trim();
      input.disabled = true;
      handleCommand(command);
    }
  });

  terminal.scrollTop = terminal.scrollHeight;
}

function handleCommand(command) {
  if (!command) {
    promptInput();
    return;
  }
  const tokens = command.split(" ");
  const cmd = tokens[0];
  let result = "";

  switch (cmd) {
    case "mkdir":
      if (tokens.length === 2) result = fs.mkdir(tokens[1]);
      else result = "Usage: mkdir <dirname>";
      break;
    case "cd":
      if (tokens.length === 2) result = fs.cd(tokens[1]) || fs.pwd();
      else result = "Usage: cd <dirname>";
      break;
    case "ls":
      result = fs.ls();
      break;
    case "pwd":
      result = fs.pwd();
      break;
    case "create":
      if (tokens.length === 2) result = fs.create(tokens[1]);
      else result = "Usage: create <filename>";
      break;
    case "write":
      if (tokens.length >= 3) {
        result = fs.write(tokens[1], tokens.slice(2).join(" "));
      } else {
        result = "Usage: write <filename> <content>";
      }
      break;
    case "read":
      if (tokens.length === 2) result = fs.read(tokens[1]);
      else result = "Usage: read <filename>";
      break;
    case "exit":
      print("Exiting VFS Simulator. Reload page to start again.");
      return;
    default:
      result = "Invalid command or syntax.";
  }

  if (result) print(result);
  promptInput();
}

print("Welcome to the Virtual File System Simulator!");
print("Type commands below. Commands: mkdir, cd, ls, pwd, create, write, read, exit");
promptInput();
