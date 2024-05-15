import * as path from "node:path";

import * as core from "@actions/core";
import { exec } from "@actions/exec";

import { OPAM_DEPEXT_FLAGS, PLATFORM } from "./constants.js";

export async function installDepext(ocamlVersion: string) {
  await core.group("Install depext", async () => {
    const depextCygwinports =
      PLATFORM === "win32-disabled" ? ["depext-cygwinports"] : [];
    await exec("opam", ["install", "opam-depext", ...depextCygwinports]);
    if (PLATFORM === "win32") {
      let base = "";
      if (ocamlVersion.includes("mingw64")) {
        base = "x86_64-w64-mingw32";
      } else if (ocamlVersion.includes("mingw32")) {
        base = "i686-w64-mingw32";
      }
      core.addPath(
        path.posix.join("/", "usr", base, "sys-root", "mingw", "bin"),
      );
    }
  });
}

export async function installDepextPackages(fpaths: string[]) {
  await core.group(
    "Install system packages required by opam packages",
    async () => {
      const fnames = fpaths.map((fpath) => path.basename(fpath, ".opam"));
      await exec("opam", ["depext", ...fnames, ...OPAM_DEPEXT_FLAGS]);
    },
  );
}
