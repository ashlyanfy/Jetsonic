# Static landing site served by a tiny nginx. No Node runtime in the final
# image — keeps the footprint to a few MB of RAM on the shared Hetzner box.
FROM nginx:1.27-alpine

# Bust the service-worker cache name on every image build so returning
# visitors pick up new deploys (mirrors the old Netlify build step).
# BUILD_ID is passed by docker-compose (see docker-compose.prod.yml).
ARG BUILD_ID=dev
RUN true

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the site. .dockerignore keeps node_modules / tooling out.
COPY . /usr/share/nginx/html

# Inject the build id into the SW cache name (POSIX sh, busybox-compatible).
RUN sed -i "s/jetsonic-pwa-v[^']*/jetsonic-pwa-${BUILD_ID}/" /usr/share/nginx/html/service-worker.js || true

# Remove files that should not be publicly served.
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/netlify.toml \
          /usr/share/nginx/html/package.json \
          /usr/share/nginx/html/package-lock.json \
          /usr/share/nginx/html/README.md

EXPOSE 80
