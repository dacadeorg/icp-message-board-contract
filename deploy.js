#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const GREEN = "\x1b[1;32m";
const NORMAL = "\x1b[0m";
const BOLD = "\x1b[1m";

function getHost() {
  if (process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    return `https://${process.env.CODESPACE_NAME}-4943.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}`;
  } else {
    return "http://127.0.0.1:4943";
  }
}

function main() {
  const rootPath = path.dirname("./");
  const canisterIdFile = path.join(
    rootPath,
    ".dfx",
    "local",
    "canister_ids.json"
  );

  if (!fs.existsSync(canisterIdFile)) {
    console.log("Run 'dfx deploy' first.");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(canisterIdFile));
  const frontendCanisters = [];
  const backendCanisters = [];
  let candidUiCanisterId = "";

  for (const [key, value] of Object.entries(data)) {
    if (key === "__Candid_UI") {
      candidUiCanisterId = value.local;
    } else if (key.includes("frontend")) {
      frontendCanisters.push({ name: key, id: value.local });
    } else {
      backendCanisters.push({ name: key, id: value.local });
    }
  }

  const host = getHost();

  console.log(`${BOLD}URLs:${NORMAL}`);

  if (frontendCanisters.length > 0) {
    console.log(`${BOLD}  Frontend canister via browser${NORMAL}`);
    frontendCanisters.forEach((canister) => {
      console.log(
        `${BOLD}    ${canister.name}: ${GREEN}${host}/?canisterId=${canister.id}${NORMAL}`
      );
    });
  }

  if (backendCanisters.length > 0) {
    console.log(`${BOLD}  Backend canister via Candid interface:${NORMAL}`);
    backendCanisters.forEach((canister) => {
      console.log(
        `${BOLD}    ${canister.name}: ${GREEN}${host}/?canisterId=${candidUiCanisterId}&id=${canister.id}${NORMAL}`
      );
    });
  }
}

main();
