## Getting started

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/fxgst/icp-message-board-contract)

If you rather want to use GitHub Codespaces, click this button instead:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/fxgst/icp-message-board-contract?quickstart=1)

**NOTE**: After `dfx deploy`, when developing in GitHub Codespaces, run `./canister_urls.py` and click the links that are shown there.

[![Open locally in Dev Containers](https://img.shields.io/static/v1?label=Dev%20Containers&message=Open&color=blue&logo=visualstudiocode)](https://vscode.dev/redirect?url=vscode://ms-vscode-remote.remote-containers/cloneInVolume?url=https://github.com/fxgst/icp-message-board-contract)

## Prerequisities

1. Install `nvm`:
- `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

2. Switch to node v18:
- `nvm use 18`
- `npm i esbuild-wasm` - for Apple Silicon only

3. Install `dfx`
- `DFX_VERSION=0.15.0 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"`

4. Add `dfx` to PATH:
- `echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"`

5. Create a project structure:
- create `src` dir
- create `index.ts` in the `src` dir
- create `tsconfig.json` in the root directory with the next content
```
{
    "compilerOptions": {
        "strict": true,
        "target": "ES2020",
        "moduleResolution": "node",
        "allowJs": true,
        "outDir": "HACK_BECAUSE_OF_ALLOW_JS"
    }
}
```
- create `dfx.json` with the next content
```
{
  "canisters": {
    "message_board": {
      "type": "custom",
      "main": "src/index.ts",
      "candid": "src/index.did",
      "build": "npx azle message_board",
      "ts": "src/index.ts",
      "wasm": ".azle/message_board/message_board.wasm",
      "gzip": true
    }
  }
}
```
where `message_board` is the name of the canister. 

6. Create a `package.json` with the next content and run `npm i`:
```
{
  "name": "message_board",
  "version": "0.1.0",
  "description": "Internet Computer message board application",
  "dependencies": {
    "@dfinity/agent": "^0.19.2",
    "@dfinity/candid": "^0.19.2",
    "azle": "^0.18.6",
    "uuid": "^9.0.0"
  },
  "engines": {
    "node": "^12 || ^14 || ^16 || ^18"
  }
}
```

7. Run a local replica in background
- `dfx start --background`

#### IMPORTANT NOTE 
If you make any changes to the `StableBTreeMap` structure like change datatypes for keys or values, changing size of the key or value, you need to restart `dfx` with the `--clean` flag. `StableBTreeMap` is immutable and any changes to it's configuration after it's been initialized are not supported.
- `dfx start --background --clean`

8. Deploy a canister
- `dfx deploy`

9. Stop a local replica
- `dfx stop`

## Interaction with the canister

When a canister is deployed, `dfx deploy` produces a link to the Candid interface in the shell output.

Candid interface provides a simple UI where you can interact with functions in the canister.

On the other hand, you can interact with the canister using `dfx` via CLI:
### create a message:
- `dfx canister call <CANISTER_NAME> addMessage`
Example: 
- `dfx canister call message_board addMessage '(record {"title"= "todo list"; "body"= "some important things"; "attachmentURL"= "url/path/to/some/photo/attachment"})'`
Response:
```
(
  variant {
    Ok = record {
      id = "79daba82-18ce-4f69-afa1-7b3389368d1f";
      attachmentURL = "url/path/to/some/photo/attachment";
      title = "todo list";
      updated_at = null;
      body = "some important things";
      created_at = 1_685_568_853_915_736_000 : nat64;
    }
  },
)
```

### update a message:
- `dfx canister call <CANISTER_NAME> updateMessage`
Example (In this case we include a message id in the payload to identify the message we want to update): 
- `dfx canister call message_board updateMessage '("79daba82-18ce-4f69-afa1-7b3389368d1f", record {"title"= "UPDATED TODO LIST TITLE"; "body"= "some important things"; "attachmentURL"= "url/path/to/some/photo/attachment"})'`
Response:
```
(
  variant {
    Ok = record {
      id = "79daba82-18ce-4f69-afa1-7b3389368d1f";
      attachmentURL = "url/path/to/some/photo/attachment";
      title = "UPDATED TODO LIST TITLE";
      updated_at = opt (1_685_569_153_977_599_000 : nat64);
      body = "some important things";
      created_at = 1_685_568_853_915_736_000 : nat64;
    }
  },
)
```

### get all messages:
- `dfx canister call <CANISTER_NAME> getMessages`
Example:
- `dfx canister call message_board getMessages '()'`
where:
- `message_board` is the name of the canister
- `getMessages` is the name of the function to call
- `'()'` - function arguments. In this case it's empty because `getMessages` accepts no arguments.
Response:
```
(
  variant {
    Ok = vec {
      record {
        id = "79daba82-18ce-4f69-afa1-7b3389368d1f";
        attachmentURL = "url/path/to/some/photo/attachment";
        title = "UPDATED TODO LIST TITLE";
        updated_at = opt (1_685_569_153_977_599_000 : nat64);
        body = "some important things";
        created_at = 1_685_568_853_915_736_000 : nat64;
      };
    }
  },
)
```

### delete a message:
- `dfx canister call <CANISTER_NAME> deleteMessage`
Example (here we only provide a message id):
- `dfx canister call message_board deleteMessage '("79daba82-18ce-4f69-afa1-7b3389368d1f")'`
Response (returns the deleted message):
```
(
  variant {
    Ok = record {
      id = "79daba82-18ce-4f69-afa1-7b3389368d1f";
      attachmentURL = "url/path/to/some/photo/attachment";
      title = "UPDATED TODO LIST TITLE";
      updated_at = opt (1_685_569_153_977_599_000 : nat64);
      body = "some important things";
      created_at = 1_685_568_853_915_736_000 : nat64;
    }
  },
)
```
