FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    coreutils \
    curl \
    findutils \
    gawk \
    grep \
    iproute2 \
    iputils-ping \
    less \
    nano \
    passwd \
    procps \
    sudo \
    util-linux \
    vim-tiny \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash student \
    && echo "student ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/student \
    && mkdir -p /home/student/workspace \
    && chown -R student:student /home/student

WORKDIR /root
CMD ["sleep", "infinity"]
