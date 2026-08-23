# Repository Security and Cleanup

## Scope

This repository cleanup retains runtime code, Prisma schema and migrations, deployment configuration, CI, tests, and intentional seed/import tooling. No uncertain application component, route, service, migration, or dependency was removed.

## Removed artifacts

- `upload-test.mjs`: local upload probe containing a hardcoded development login credential; it was not referenced by project scripts.
- `apps/api/.email-captures/*.html`: generated test email captures containing test recipient data; they are not source files.

Generated reports and local uploads remain ignored rather than deleted when their use could not be established from tracked references.

## Environment and secrets

- Keep `.env` and all `.env.*` files out of Git; only `.env.example` files may be committed.
- Use random values of at least 32 characters for `JWT_SECRET` outside development and tests.
- Provide all `SEED_*_PASSWORD` values explicitly before running the Prisma seed; do not use shared or production databases for seed data.
- Provide `POSTGRES_USER` and `POSTGRES_PASSWORD` before starting the local Docker database.
- Store Resend, Cloudinary, database, Railway, and deployment credentials in the hosting provider or CI secret store, never in source or logs.

## Branch and deployment workflow

- Work on a feature or maintenance branch, open a pull request, and merge to `main` only after review and passing CI.
- Production deployments must use managed secrets, HTTPS URLs, Cloudinary/object storage for persistent media, and a database backup/rollback plan.
- Container startup now fails if Prisma migrations fail, preventing an API from running against an unverified schema.

## Local validation

Run dependency installation with the lockfile, then run the repository lint, typecheck/build, and tests appropriate to the changed packages. Confirm `git status`, `git diff`, and `git ls-files` contain no environment files, credentials, private keys, generated builds, or test captures.

## Manual actions still required

- Rotate the admin credential from `upload-test.mjs` if that file was ever shared or committed in any remote/history.
- Review hosting and CI history for previously exposed credentials and rotate any matching database, JWT, Resend, Cloudinary, Railway, or private-key credentials.
- Enable GitHub branch protection on `main`: pull requests, required CI checks, restricted direct pushes, and required review as appropriate.
- Keep production `JWT_SECRET`, database URLs, seed passwords, and media/email credentials configured in Railway/Vercel/CI secret settings.
- If any real secret is found in Git history, investigate removal with a separate approved history-rewrite process; deleting a current file alone is insufficient.
