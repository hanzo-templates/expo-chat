# Hanzo Chat (Expo)

Streaming AI chat client on Expo Router, wired to the Hanzo /v1 API.

**Live demo** — https://expo-chat.hanzo.app — the **same** app, rendered by react-native-web from this source. Not a mock-up.

## What you get

Token-by-token streaming from `POST /v1/chat/completions`, an SSE reader that
survives frames split across packets, and a Settings tab that sets the base URL,
model and key **at run time** — an `EXPO_PUBLIC_*` key is compiled into the
bundle and therefore shipped to every user.

## Run it

```sh
npm install
npx expo start          # press i for the iOS simulator
npx expo export -p web  # the static bundle the live demo serves
```

## Building for iOS — read this first

**Our runner fleet cannot produce an iOS build today.** Two separate gaps, both
measured rather than assumed:

1. **No macOS runner exists.** An archive / IPA needs macOS + Xcode + a signing
   identity. Every runner registered to `hanzoai` (519 of them) reports
   `os: linux`; `luxfi` has 151, same; `zooai` has none. The only macOS builds
   in the org today (`hanzoai/world` `build-desktop.yml`) run on GitHub-**hosted**
   `macos-14`, which is what the house CI rule exists to avoid.
2. **`hanzo-templates` is not in the arcd org list.** `arcd` serves
   `hanzoai, luxfi, zooai, parsdao, zenlm`. Until this org is added, even the
   Linux jobs in `hanzo.yml` sit `queued` with no runner to claim them.

A third gap turned up while wiring this and is already **fixed**: this org
defaulted `GITHUB_TOKEN` to `read`, and `hanzoai/ci` declares
`permissions: packages: write`. A caller cannot be granted more than the org
maximum, so every run died as `startup_failure` before a job was even created —
no logs, no annotation, nothing to read. The org now defaults to `write`, the
same as `hanzoai`, and runs reach `queued`. If you fork these into another org
and see `startup_failure` with an empty log, check
`/orgs/<org>/actions/permissions/workflow` first.

So `hanzo.yml` declares only what a Linux arc runner *could* run, and the
macOS archive sits in a separate `workflow_dispatch`-only
`.github/workflows/ios.yml` — a job pinned to a label nothing advertises would
queue forever if it fired on push.

Both gaps close with the installer, no code change:

```sh
# (2) serve this org — re-run on any existing arcd host
~/work/hanzo/arc/scripts/install-arcd.sh \
  --labels self-hosted,linux,amd64 \
  --orgs hanzoai,luxfi,zooai,parsdao,zenlm,hanzo-templates

# (1) add the macOS lane — on an Apple Silicon Mac, once
xcode-select --install && sudo xcodebuild -license accept
~/work/hanzo/arc/scripts/install-arcd.sh \
  --labels self-hosted,macos,arm64,xcode \
  --orgs hanzoai,luxfi,zooai,parsdao,zenlm,hanzo-templates
```

Then `runs-on: [self-hosted, macos, arm64, xcode]` resolves and `ios.yml`
archives + exports the IPA. Signing material comes from KMS
(`kms.hanzo.ai`), never from a checked-in `.p12`.


## CI

`hanzo.yml` + a seven-line `.github/workflows/cicd.yml` importing
`hanzoai/ci`. On every push a Linux arc runner runs:

- **typecheck** — `npm ci && npx tsc --noEmit`
- **web-bundle** — `npx expo export -p web`


`.github/workflows/ios.yml` holds the macOS archive job and is
`workflow_dispatch` only — see above.

## Upstream

Derived from **expo/expo · templates/expo-template-tabs** (MIT). This template is MIT; the upstream licence
travels with the code it came from.
