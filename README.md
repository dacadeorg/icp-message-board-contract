## Prerequisities

1. Install `nvm`:
- `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash`

2. Switch to node v18:
- `nvm use 18`

3. Install `dfx`
- `DFX_VERSION=0.14.0 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"`

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
        "experimentalDecorators": true,
        "strictPropertyInitialization": false,
        "moduleResolution": "node",
        "allowJs": true,
        "outDir": "HACK_BECAUSE_OF_ALLOW_JS",
        "allowSyntheticDefaultImports": true
    }
}
```
- create `dfx.json` with the next content
```
{
  "canisters": {
    "message_board": {
      "main": "src/index.ts",
      "type": "custom",
      "build": "npx azle message_board",
      "root": "src",
      "ts": "src/index.ts",
      "candid": "src/index.did",
      "wasm": ".azle/message_board/message_board.wasm.gz"
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
    "@dfinity/agent": "^0.15.6",
    "@dfinity/candid": "^0.15.6",
    "azle": "0.16.2"
  },
  "engines": {
    "node": "^12 || ^14 || ^16 || ^18"
  },
  "devDependencies": {
    "uuid": "^9.0.0"
  }
}
```

7. Run local replica in background
- `dfx start --background`

8. Deploy a canister
- `dfx deploy`

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
