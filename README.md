# AIFOREU preview redirect

The main preview is https://d0ublemm.github.io/aiforeu-preview/.

This repository publishes **main:/docs** through GitHub Pages. The files in
`docs/` redirect the organization address to the same path on the main preview,
preserving query parameters and fragments. Existing HTML routes also have a
no-JavaScript redirect and a visible fallback link. `404.html` forwards unknown
paths to the main host.

The root website files are retained as history/reference and are not served.
Do not synchronize website exports to this repository. Publish site updates to
`d0ubleMM/aiforeu-preview` (`main:/`), and keep this repository redirect-only.

Redirects are generated from the website routes with
`werkzeuge/prepare_preview_redirects.py` in the separate development repository.
