# Update package

- run test (run tests/index.html)
- run: npm run build
- commit changes
- update version in package.json, bower.json
- commit changes `git ci -m 'v1.2.x'` & create git version tag `git tag -a v1.2.x`
- push to upstream `git push | git push --tags`
- publish to npm `npm publish` (bower update from GitHub)