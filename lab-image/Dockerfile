# Both can be overridden for networks where Docker Hub or the Ubuntu archive is
# blocked, e.g. from Iran:
#   docker build --build-arg BASE_IMAGE=docker.arvancloud.ir/library/ubuntu:24.04 \
#                --build-arg APT_MIRROR=https://mirror-linux.runflare.com/ubuntu ./lab-image
ARG BASE_IMAGE=ubuntu:24.04
FROM ${BASE_IMAGE}

ARG APT_MIRROR=
ENV DEBIAN_FRONTEND=noninteractive

RUN if [ -n "$APT_MIRROR" ]; then \
      sed -i -e "s|http://archive.ubuntu.com/ubuntu|$APT_MIRROR|g" \
             -e "s|http://security.ubuntu.com/ubuntu|$APT_MIRROR|g" \
             /etc/apt/sources.list.d/ubuntu.sources; \
    fi \
    && apt-get update && apt-get install -y --no-install-recommends \
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
    golang-go \
    gcc \
    libc6-dev \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash student \
    && echo "student ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/student \
    && mkdir -p /home/student/workspace \
    && chown -R student:student /home/student

# Go labs (Backend track). Labs run with --network none, so everything must
# work offline: stdlib only, no module proxy, no toolchain downloads.
# GOMAXPROCS/-p keep the build under the container's PID limit (LAB_MAX_PROCESSES).
ENV GOTOOLCHAIN=local \
    GOPROXY=off \
    GOFLAGS=-p=2 \
    GOMAXPROCS=2 \
    GOPATH=/root/go \
    GOCACHE=/root/.cache/go-build \
    CGO_ENABLED=1

# Pre-build the standard library (normal and -race) so the first `go test`
# in a lab takes seconds instead of minutes on a 0.5 CPU sandbox.
RUN mkdir -p /tmp/warm && cd /tmp/warm \
    && printf 'module warm\n\ngo 1.22\n' > go.mod \
    && printf 'package warm\n\nimport (\n\t"context"\n\t"net/http/httptest"\n\t"sync"\n)\n\nvar _ = httptest.NewRecorder\nvar _ sync.Mutex\nvar _ = context.Background\n' > warm.go \
    && printf 'package warm\n\nimport "testing"\n\nfunc TestWarm(t *testing.T) {}\n' > warm_test.go \
    && go test ./... && go test -race ./... && go vet ./... \
    && cd / && rm -rf /tmp/warm

WORKDIR /root
CMD ["sleep", "infinity"]
