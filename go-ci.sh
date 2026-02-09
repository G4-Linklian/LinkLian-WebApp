#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-all}" # help | deps | lint | jest | jest:watch | test | sca | build | docker | container-scan | secrets | all

# ---------- helpers ----------
step() {
  echo
  echo "==> $1"
  echo "    $2"
}

die() {
  echo
  echo "❌ FAIL at: $1"
  echo "    What it checks: $2"
  if [[ -n "${3:-}" ]]; then
    echo "    Details:"
    echo -e "$3"
  fi
  exit 1
}

need_cmd() { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<'EOF'
Usage:
  ./go-ci.sh [mode]

Modes:
  help            Show this help

  deps            Install deps (Yarn Berry/Classic supported)
  lint            yarn lint
  jest            yarn test (fast)
  jest:watch      yarn test:watch (local loop)
  test            unit tests (+optional coverage check)

  sca             dependency vuln check (yarn npm audit / npm audit fallback)
  build           yarn build
  docker          docker compose build + docker build
  container-scan  trivy scan (if installed) for built image
  secrets         gitleaks scan (if installed)

  all             deps -> lint -> test -> sca -> build -> docker -> container-scan -> secrets

Examples:
  chmod +x go-ci.sh

  ./go-ci.sh deps
  ./go-ci.sh lint
  ./go-ci.sh test
  ./go-ci.sh sca
  ./go-ci.sh build
  ./go-ci.sh docker
  ./go-ci.sh container-scan
  ./go-ci.sh secrets

  # รวดเดียว
  ./go-ci.sh all
EOF
}

if [[ "${MODE}" == "help" || "${MODE}" == "-h" || "${MODE}" == "--help" ]]; then
  usage
  exit 0
fi

# ---------- package manager helpers ----------
is_yarn_berry() {
  [[ -f ".yarnrc.yml" ]] && [[ -d ".yarn" ]]
}

pm_install() {
  step "deps" "Install dependencies using lockfile (prefers Yarn)."
  if need_cmd yarn; then
    if is_yarn_berry; then
      yarn install --immutable || die "yarn install" "Dependency install" "Run: yarn install --immutable"
    else
      yarn install --frozen-lockfile || die "yarn install" "Dependency install" "Run: yarn install --frozen-lockfile"
    fi
  else
    die "yarn" "Yarn not found" "Install Yarn or enable Corepack (Node 16+): corepack enable"
  fi
}

pm_run() {
  local script="$1"
  yarn -s run "$script"
}

# ---------- steps ----------
run_deps() { pm_install; }

run_lint() {
  run_deps
  step "lint" "Runs ESLint (project rules)."
  pm_run lint || die "lint" "Lint rules" "Run: yarn lint"
  echo "    ✅ lint OK"
}

run_jest() {
  run_deps
  step "jest (fast)" "Runs Jest quickly (no enforced coverage)."
  pm_run test || die "jest" "Unit tests via Jest" "Run: yarn test"
  echo "    ✅ jest OK"
}

run_jest_watch() {
  run_deps
  step "jest watch" "Runs Jest in watch mode."
  pm_run test:watch || die "jest watch" "Watch mode" "Ensure package.json has test:watch"
}

run_test_cov() {
  run_deps
  step "unit tests (+coverage if configured)" "Runs tests. If coverage exists, checks lcov."
  # prefer test:cov if your project has it
  if yarn -s run test:cov >/dev/null 2>&1; then
    pm_run test:cov || die "test:cov" "Unit tests + coverage" "Run: yarn test:cov"
  else
    pm_run test || die "test" "Unit tests" "Run: yarn test"
  fi

  if [[ -f "coverage/lcov.info" ]]; then
    echo "    ✅ coverage/lcov.info found"
  else
    echo "    ⚠️ coverage/lcov.info not found (ok if your project doesn't generate coverage)"
  fi
}

run_sca() {
  run_deps
  step "SCA" "Checks dependency vulnerabilities (High+)."
  if is_yarn_berry; then
    yarn npm audit --all --severity high || die "yarn npm audit" "Dependency vulnerabilities (High+)" \
      "Try: yarn npm audit --all --severity high"
  else
    if need_cmd npm; then
      npm audit --audit-level=high || die "npm audit" "Dependency vulnerabilities (High+)" \
        "Try: npm audit --audit-level=high"
    else
      die "sca" "npm not found" "Install Node/npm"
    fi
  fi
  echo "    ✅ SCA OK"
}

run_build() {
  run_deps
  step "build" "Builds the web app (Next.js)."
  pm_run build || die "build" "Build step" "Run: yarn build"
  echo "    ✅ build OK"
}

run_docker() {
  run_deps
  step "docker compose build" "Builds services from docker-compose.yml."
  need_cmd docker || die "docker" "Docker availability" "Install Docker Desktop / Docker Engine first"
  docker compose -f docker-compose.yml build || die "docker compose build" \
    "Build images from docker-compose.yml" \
    "Run: docker compose -f docker-compose.yml build"
  echo "    ✅ docker compose build OK"

  step "docker build (image)" "Builds Dockerfile image locally."
  IMAGE_TAG="linklian-webapp:local"
  docker build -t "$IMAGE_TAG" -f Dockerfile . || die "docker build" "Docker image build" \
    "Run: docker build -t linklian-webapp:local -f Dockerfile ."
  echo "    ✅ docker build OK"
}

run_container_scan() {
  step "container scan (Trivy)" "Scans built image for HIGH/CRITICAL vulnerabilities."
  local IMAGE_TAG="linklian-webapp:local"
  if need_cmd trivy; then
    trivy image --severity HIGH,CRITICAL --ignore-unfixed "$IMAGE_TAG" \
      || die "trivy scan" "Container vulnerabilities (HIGH/CRITICAL)" \
         "Install Trivy: https://aquasecurity.github.io/trivy (or brew install trivy)"
    echo "    ✅ trivy scan OK"
  else
    echo "    ⚠️ trivy not found -> skip local container scan (CI will run it)"
  fi
}

run_secrets() {
  step "secret scan (gitleaks)" "Scans repository for leaked secrets."
  if need_cmd gitleaks; then
    gitleaks detect --redact --no-git || die "gitleaks" \
      "Secrets leaked in working tree" \
      "Install gitleaks then rerun: gitleaks detect --redact --no-git"
    echo "    ✅ gitleaks OK"
  else
    echo "    ⚠️ gitleaks not found -> skip local secret scan (CI will run it)"
  fi
}

case "$MODE" in
  deps)           run_deps ;;
  lint)           run_lint ;;
  jest)           run_jest ;;
  jest:watch)     run_jest_watch ;;
  test)           run_test_cov ;;
  sca)            run_sca ;;
  build)          run_build ;;
  docker)         run_docker ;;
  container-scan) run_container_scan ;;
  secrets)        run_secrets ;;
  all)
    run_deps
    run_lint
    run_test_cov
    run_sca
    run_build
    run_docker
    run_container_scan
    run_secrets
    ;;
  *)
    echo "Unknown mode: $MODE"
    usage
    exit 2
    ;;
esac

echo
echo "✅ All requested checks passed (mode: $MODE)"
#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-all}" # help | deps | lint | jest | jest:watch | test | sca | build | docker | container-scan | secrets | all

# ---------- helpers ----------
step() {
  echo
  echo "==> $1"
  echo "    $2"
}

die() {
  echo
  echo "❌ FAIL at: $1"
  echo "    What it checks: $2"
  if [[ -n "${3:-}" ]]; then
    echo "    Details:"
    echo -e "$3"
  fi
  exit 1
}

need_cmd() { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<'EOF'
Usage:
  ./go-ci.sh [mode]

Modes:
  help            Show this help

  deps            Install deps (Yarn Berry/Classic supported)
  lint            yarn lint
  jest            yarn test (fast)
  jest:watch      yarn test:watch (local loop)
  test            unit tests (+optional coverage check)

  sca             dependency vuln check (yarn npm audit / npm audit fallback)
  build           yarn build
  docker          docker compose build + docker build
  container-scan  trivy scan (if installed) for built image
  secrets         gitleaks scan (if installed)

  all             deps -> lint -> test -> sca -> build -> docker -> container-scan -> secrets

Examples:
  chmod +x go-ci.sh
  ./go-ci.sh deps
  ./go-ci.sh lint
  ./go-ci.sh test
  ./go-ci.sh docker
  ./go-ci.sh all
EOF
}

if [[ "${MODE}" == "help" || "${MODE}" == "-h" || "${MODE}" == "--help" ]]; then
  usage
  exit 0
fi

# ---------- package manager helpers ----------
is_yarn_berry() {
  [[ -f ".yarnrc.yml" ]] && [[ -d ".yarn" ]]
}

pm_install() {
  step "deps" "Install dependencies using lockfile (prefers Yarn)."
  if need_cmd yarn; then
    if is_yarn_berry; then
      yarn install --immutable || die "yarn install" "Dependency install" "Run: yarn install --immutable"
    else
      yarn install --frozen-lockfile || die "yarn install" "Dependency install" "Run: yarn install --frozen-lockfile"
    fi
  else
    die "yarn" "Yarn not found" "Install Yarn or enable Corepack (Node 16+): corepack enable"
  fi
}

pm_run() {
  local script="$1"
  yarn -s run "$script"
}

# ---------- steps ----------
run_deps() { pm_install; }

run_lint() {
  run_deps
  step "lint" "Runs ESLint (project rules)."
  pm_run lint || die "lint" "Lint rules" "Run: yarn lint"
  echo "    ✅ lint OK"
}

run_jest() {
  run_deps
  step "jest (fast)" "Runs Jest quickly (no enforced coverage)."
  pm_run test || die "jest" "Unit tests via Jest" "Run: yarn test"
  echo "    ✅ jest OK"
}

run_jest_watch() {
  run_deps
  step "jest watch" "Runs Jest in watch mode."
  pm_run test:watch || die "jest watch" "Watch mode" "Ensure package.json has test:watch"
}

run_test_cov() {
  run_deps
  step "unit tests (+coverage if configured)" "Runs tests. If coverage exists, checks lcov."
  # prefer test:cov if your project has it
  if yarn -s run test:cov >/dev/null 2>&1; then
    pm_run test:cov || die "test:cov" "Unit tests + coverage" "Run: yarn test:cov"
  else
    pm_run test || die "test" "Unit tests" "Run: yarn test"
  fi

  if [[ -f "coverage/lcov.info" ]]; then
    echo "    ✅ coverage/lcov.info found"
  else
    echo "    ⚠️ coverage/lcov.info not found (ok if your project doesn't generate coverage)"
  fi
}

run_sca() {
  run_deps
  step "SCA" "Checks dependency vulnerabilities (High+)."
  if is_yarn_berry; then
    yarn npm audit --all --severity high || die "yarn npm audit" "Dependency vulnerabilities (High+)" \
      "Try: yarn npm audit --all --severity high"
  else
    if need_cmd npm; then
      npm audit --audit-level=high || die "npm audit" "Dependency vulnerabilities (High+)" \
        "Try: npm audit --audit-level=high"
    else
      die "sca" "npm not found" "Install Node/npm"
    fi
  fi
  echo "    ✅ SCA OK"
}

run_build() {
  run_deps
  step "build" "Builds the web app (Next.js)."
  pm_run build || die "build" "Build step" "Run: yarn build"
  echo "    ✅ build OK"
}

run_docker() {
  run_deps
  step "docker compose build" "Builds services from docker-compose.yml."
  need_cmd docker || die "docker" "Docker availability" "Install Docker Desktop / Docker Engine first"
  docker compose -f docker-compose.yml build || die "docker compose build" \
    "Build images from docker-compose.yml" \
    "Run: docker compose -f docker-compose.yml build"
  echo "    ✅ docker compose build OK"

  step "docker build (image)" "Builds Dockerfile image locally."
  IMAGE_TAG="linklian-webapp:local"
  docker build -t "$IMAGE_TAG" -f Dockerfile . || die "docker build" "Docker image build" \
    "Run: docker build -t linklian-webapp:local -f Dockerfile ."
  echo "    ✅ docker build OK"
}

run_container_scan() {
  step "container scan (Trivy)" "Scans built image for HIGH/CRITICAL vulnerabilities."
  local IMAGE_TAG="linklian-webapp:local"
  if need_cmd trivy; then
    trivy image --severity HIGH,CRITICAL --ignore-unfixed "$IMAGE_TAG" \
      || die "trivy scan" "Container vulnerabilities (HIGH/CRITICAL)" \
         "Install Trivy: https://aquasecurity.github.io/trivy (or brew install trivy)"
    echo "    ✅ trivy scan OK"
  else
    echo "    ⚠️ trivy not found -> skip local container scan (CI will run it)"
  fi
}

run_secrets() {
  step "secret scan (gitleaks)" "Scans repository for leaked secrets."
  if need_cmd gitleaks; then
    gitleaks detect --redact --no-git || die "gitleaks" \
      "Secrets leaked in working tree" \
      "Install gitleaks then rerun: gitleaks detect --redact --no-git"
    echo "    ✅ gitleaks OK"
  else
    echo "    ⚠️ gitleaks not found -> skip local secret scan (CI will run it)"
  fi
}

case "$MODE" in
  deps)           run_deps ;;
  lint)           run_lint ;;
  jest)           run_jest ;;
  jest:watch)     run_jest_watch ;;
  test)           run_test_cov ;;
  sca)            run_sca ;;
  build)          run_build ;;
  docker)         run_docker ;;
  container-scan) run_container_scan ;;
  secrets)        run_secrets ;;
  all)
    run_deps
    run_lint
    run_test_cov
    run_sca
    run_build
    run_docker
    run_container_scan
    run_secrets
    ;;
  *)
    echo "Unknown mode: $MODE"
    usage
    exit 2
    ;;
esac

echo
echo "✅ All requested checks passed (mode: $MODE)"
