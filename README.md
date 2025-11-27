
# SysDump

SysDump is a small utility written in TypeScript for Bun that collects system information and extracts Chrome user-state files (Local State and Preferences) from a Windows user profile. It is intended as a developer/diagnostic helper to quickly create a snapshot of hardware, OS, Chrome settings and installed extensions for the current interactive user.

## Highlights

- Runs on Windows (reads from the local AppData Chrome profile paths).
- Uses the `systeminformation` package to collect CPU, GPU, RAM and system details.
- Reads Chrome `Local State` and `Preferences` and enumerates installed extensions.
- Writes a human-readable `sysdump.txt` plus copies of `Local State` and `Preferences` into `output/<username>/`.
- Built and run using the Bun runtime (project configured as a Bun module).

## Quick facts / contract

- Input: none (reads the currently logged-in user via `systeminformation.users()` and Windows user paths).
- Output: `output/<username>/sysdump.txt`, `output/<username>/Local State`, `output/<username>/Preferences`.
- Error mode: on exception the script writes an `error.txt` file with the error message.

## Requirements

- Node-compatible environment on Windows with access to the user's AppData folder.
- Chrome must use the standard user data path for the target user for the Chrome-related parts to succeed.

Dependencies (from `package.json`):

- `systeminformation` — used to query hardware and OS information.

Note: `package.json` declares `typescript` as a peer dependency and `@types/bun` as a dev dependency.

## Installation

1. Install Bun: follow the official instructions at [https://bun.sh/](https://bun.sh/) if you don't already have it.
2. (Optional) Install dependencies if you want to run TypeScript checks; Bun will handle runtime imports when running the script.

## Usage

Run in development mode (watch):

```bash
bun --watch ./index.ts
```

Or use the project's npm scripts (they invoke Bun):

```bash
# start the live watcher
npm run start

# build the project (this runs the build script which uses Bun to produce a dist)
npm run build
```

When run, the script will print a short header and then write files under `output/<username>/`.

Example output files created:

- `output/vecchiettis/sysdump.txt` — readable dump with system, CPU, GPU, RAM and Chrome info.
- `output/vecchiettis/Local State` — copied Chrome Local State JSON file.
- `output/vecchiettis/Preferences` — copied Chrome Preferences JSON file.

## Code notes (implementation details)

- The main script is `index.ts`. It:
  - Calls `systeminformation` for CPU, GPU, RAM and user details.
  - Builds Windows paths to Chrome's Local State and Default Profile Preferences using the first user returned by `si.users()`.
  - Enumerates extension directories under the Default `Extensions` folder and attempts to read each extension's `manifest.json` to collect names.
  - Writes the final human-readable dump and copies of Chrome files using Bun file APIs.

- The build script `build.ts` uses `Bun.build` to bundle `index.ts` into `dist` and generates a small `sysdump.bat` that attempts to call the built artifact.

## Windows-specific considerations and permission notes

- The script reads files under `C:\Users\<user>\AppData\Local\Google\Chrome\User Data`. If you run the script as a different user or from an elevated context, path resolution might differ.
- Ensure the running user has read access to the Chrome profile files. If Chrome is running and has locked files, reads may still succeed for most JSON files but extensions or other files could be inaccessible.

## Troubleshooting

- If nothing is written to `output/`, check `error.txt` (the script writes the thrown error message there).
- If Chrome-related parts fail, verify the account name detected by the script matches the local user folder name and that the `User Data` path exists.

## Contributing

Contributions are welcome. A few suggestions:

- Add a proper `LICENSE` file if you plan to publish.
- Make Chrome path detection more robust (supporting non-default profiles and non-Windows OSes).
- Add unit tests for any refactored logic (for example, extension enumeration and manifest parsing).

## Security & Privacy

This tool reads Chrome profile files (Local State and Preferences) and writes them to disk. Treat generated output as sensitive. Do not share `output/<username>/` contents without consent. Consider adding an option to redact or skip copying Chrome content.

## License

No license is specified in the repository. Add a `LICENSE` file (for example MIT) if you want to make the project permissively licensed.

