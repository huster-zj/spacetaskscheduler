#!/usr/bin/env bash
set -euo pipefail

BACKEND_DIR=/www/wwwroot/astroscheduler-backend
FRONTEND_ROOT=/www/wwwroot/astroscheduler.cn
INCOMING_DIR=/home/deploy/incoming
VENV_PYTHON=/www/wwwroot/astroscheduler-backend-venv/bin/python

artifact=${1:-}
commit=${2:-}

if [[ -z "$artifact" || -z "$commit" ]]; then
  echo "usage: deploy-astroscheduler <artifact.tar.gz> <commit>" >&2
  exit 2
fi

artifact=$(readlink -f "$artifact")
case "$artifact" in
  "$INCOMING_DIR"/*.tar.gz) ;;
  *)
    echo "artifact must be inside $INCOMING_DIR" >&2
    exit 2
    ;;
esac

if [[ ! -f "$artifact" ]]; then
  echo "artifact not found: $artifact" >&2
  exit 2
fi

stage=$(mktemp -d /tmp/astroscheduler-deploy.XXXXXX)
next_dist="$FRONTEND_ROOT/.dist-next"

cleanup() {
  rm -rf "$stage" "$next_dist"
}
trap cleanup EXIT

tar -xzf "$artifact" -C "$stage"

test -f "$stage/backend/main.py"
test -f "$stage/frontend/dist/index.html"

install -d -o copt -g copt -m 0775 "$BACKEND_DIR"
cp -a "$stage/backend/." "$BACKEND_DIR/"
chown -R copt:copt "$BACKEND_DIR"
find "$BACKEND_DIR" -type d -name __pycache__ -prune -exec rm -rf {} +

rm -rf "$next_dist"
install -d -o root -g root -m 0755 "$next_dist"
cp -a "$stage/frontend/dist/." "$next_dist/"
rm -rf "$FRONTEND_ROOT/dist"
mv "$next_dist" "$FRONTEND_ROOT/dist"

printf '%s\n' "$commit" > "$BACKEND_DIR/.deployed-commit"
printf '%s\n' "$commit" > "$FRONTEND_ROOT/.deployed-commit"
chown copt:copt "$BACKEND_DIR/.deployed-commit"

sudo -u copt -H env \
  COPT_HOME=/home/copt/copt \
  COPT_LICENSE_DIR=/home/copt/copt \
  LD_LIBRARY_PATH=/home/copt/copt/lib:/home/copt/copt/lib/python/deps \
  "$VENV_PYTHON" -c 'import coptpy as cp; env = cp.Envr(); model = env.createModel("deploy_smoke"); x = model.addVar(lb=0, ub=1, vtype=cp.COPT.BINARY); model.setObjective(x, cp.COPT.MAXIMIZE); model.solve(); assert model.status == cp.COPT.OPTIMAL and model.objval > 0.5'

systemctl restart astroscheduler-backend.service
nginx -t
systemctl reload nginx.service

for attempt in {1..20}; do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:8000/api/openapi.json >/dev/null; then
    rm -f "$artifact"
    echo "deployment complete: $commit"
    exit 0
  fi
  sleep 2
done

echo "backend health check failed" >&2
systemctl status astroscheduler-backend.service --no-pager -l >&2 || true
exit 1
