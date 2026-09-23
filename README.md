# Dnyaneshwar Suryawanshi Portfolio

Personal portfolio website for Dnyaneshwar Suryawanshi, Team Lead and Senior Test Automation Engineer.

## Live Site

[https://dnyanesh-s.github.io/](https://dnyanesh-s.github.io/)

## Contents

- Professional experience with expandable role details
- Technical skills, tools, and platforms
- Searchable and filterable skills with matched-term highlighting
- Light and dark theme toggle
- Client cards with hover, focus, and tap details
- Education and certifications
- Blog links and contact details
- Downloadable resume

## Installation and Local Development

This is a static site and has no runtime dependencies or build step.

```bash
git clone https://github.com/dnyanesh-s/dnyanesh-s.github.io.git
cd dnyanesh-s.github.io
```

For a quick preview, open `index.html` directly in a browser. To use a local
web server instead, run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

To run the same checks used by GitHub Actions locally, use the commands below:

```bash
npx --yes html-validate@9.7.1 index.html
npx --yes stylelint@16.11.0 "assets/css/**/*.css"
npx --yes markdownlint-cli2@0.17.2 "**/*.md"
```

## Quality Checks

GitHub Actions runs on pull requests to `main` and direct pushes to `main`.

- **HTML lint:** Validates `index.html` with `html-validate`.
- **Link check:** Validates links in all HTML files with Lychee.
- **JavaScript lint:** Checks browser JavaScript for undefined and unused variables with ESLint.
- **CSS lint:** Checks CSS syntax and duplicate declarations with Stylelint.
- **JSON validation:** Parses every JSON configuration file with Python.
- **Markdown lint:** Checks Markdown files with markdownlint.
- **Local asset check:** Verifies local HTML and CSS asset references exist.

To require these checks before code reaches `main`, enable branch protection in the repository settings and require all quality check status checks before merging.

## Built With

- HTML, CSS, and JavaScript
- Hosted with GitHub Pages
- No build step or local server required

## Contact

- Email: [dnyaneshwar1995@gmail.com](mailto:dnyaneshwar1995@gmail.com)
- LinkedIn: [dnyaneshwar-suryawanshi-a5a15918a](https://www.linkedin.com/in/dnyaneshwar-suryawanshi-a5a15918a/)

## License

No license is currently granted. All rights reserved.
