# works on linux
FROM --platform=linux/amd64 mcr.microsoft.com/devcontainers/typescript-node:dev-20-bookworm 

# FROM --platform=linux/amd64 debian:12

# USER root

ENV DFX_VERSION=0.17.0

# Install a basic environment needed for our build tools
RUN apt-get -yq update
RUN apt-get -yqq install --no-install-recommends curl ca-certificates \
    build-essential pkg-config libssl-dev llvm-dev liblmdb-dev clang cmake rsync git podman

# Install dfx
ENV DFXVM_INIT_YES=true
RUN sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
ENV PATH="/root/.local/share/dfx/bin:$PATH"
