ARG BAZEL_VERSION=:7.1.0
ARG NODE_VERSION=16.17.0

FROM ubuntu:20.04 AS node

ARG NODE_VERSION=16.17.0

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

ENV NVM_DIR=/opt/.nvm

# Install NVM
RUN mkdir -p /opt/.nvm &&  wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# Install Node.js and npm
RUN . "$NVM_DIR/nvm.sh" \
    && nvm install "${NODE_VERSION}" \
    && nvm use "${NODE_VERSION}" \
    && nvm alias default "${NODE_VERSION}" \
    $$ npm install -g yarn

RUN useradd -m -u 1000 node

# taken from https://github.com/google/copybara/blob/master/Dockerfile
# Set up buildtools required
FROM golang:latest AS buildtools

RUN go install github.com/bazelbuild/buildtools/buildozer@latest github.com/bazelbuild/buildtools/buildifier@latest

# Set up bazel env
FROM "gcr.io/bazel-public/bazel${BAZEL_VERSION}" AS build

USER root
RUN apt-get update && \
    apt-get install --no-install-recommends -y openjdk-17-jdk-headless git && \
    rm -rf /var/lib/apt/lists/*

# Bazel does not allow running as root
USER ubuntu

RUN git clone https://github.com/google/copybara /home/ubuntu/copybara
WORKDIR /home/ubuntu/copybara

RUN bazel build //java/com/google/copybara:copybara_deploy.jar --java_language_version=11 --tool_java_language_version=11 --java_runtime_version=remotejdk_11

# Use jammy to drop Python 2
FROM docker.io/eclipse-temurin:17-jre-jammy

RUN apt-get update && \
    apt-get install --no-install-recommends -y git mercurial quilt openssh-client openjdk-17-jdk-headless && \
    rm -rf /var/lib/apt/lists/*

ARG NODE_VERSION=16.17.0

COPY --from=node /opt/.nvm/versions/node/v"${NODE_VERSION}" /usr/local/

ENV PATH=/usr/local/bin:$PATH
ENV HOME=/root

#ENV COPYBARA_CONFIG=copy.bara.sky \
#  COPYBARA_SUBCOMMAND=migrate \
#  COPYBARA_OPTIONS='' \
#  COPYBARA_WORKFLOW=default \
#  COPYBARA_SOURCEREF=''

COPY --from=buildtools /go/bin/buildozer /go/bin/buildifier /usr/local/bin/
COPY --from=build /home/ubuntu/copybara/bazel-bin/java/com/google/copybara/copybara_deploy.jar /opt/copybara/copybara_deploy.jar
COPY ./entrypoint.sh /usr/local/bin/copybara
RUN chmod +x /usr/local/bin/copybara

ENTRYPOINT ["/usr/local/bin/copybara"]
CMD ["migrate", "copy.bara.sky"]
WORKDIR /usr/src/app
