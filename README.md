# Choose-a-license cli
Command line to select a license for your project.

The tool is using the same data as https://choosealicense.com/.

This CLI is maintained by AWolf81 and is not related to the above mentioned web site.

## Usage
`npx choosealicense-cli add MIT` or `npx choosealicense-cli` for interactive selection of license

or install it globally with

`npm i -g choosealicense-cli` or `yarn add global choosealicense-cli`

Once installed globally you can use it with:
`choosealicense add MIT` or `choosealicense`

## Why was it created?
I created it as learning experience and because I haven't found a tool that was working for me.
I tried `generator license` but that wasn't working on Windows.

So I wanted to have a tool that I can run with `$ choosealicense add MIT` and it will add a `LICENSE` file and the key to
my `package.json`.

Also an interactive selection of the license would be great.

## How does it work?
1. The CLI request the licenses from `https://api.github.com/licenses` and creates a list of available licenses.
2. The user selects a license
3. Create a LICENSE file [Y/n]? Y = create LICENSE file 
4. Enter full name (defaults to `git config user.name`)
5. Add/Update license key in `package.json` [Y/n]? Y = add license key to `package.json` 

TODOS:
- [ ] Check if caching of the licenses is required
- [x] Add links to each license so it's possible to get more details to a license
- [ ] Add direct add command e.g. choosealicense add mit
- [ ] Publish on npm
- [ ] Check usage of other choosealicense cli https://www.npmjs.com/package/choosealicense
