# Multi Cherry-Pick Extension Tool

[![Build Status](https://dev.azure.com/1es-cat/azure-repos-pr-multi-cherry-pick/_apis/build/status/microsoft.azure-repos-pr-multi-cherry-pick?branchName=master)](https://dev.azure.com/1es-cat/azure-repos-pr-multi-cherry-pick/_build/latest?definitionId=24&branchName=master)

An easy way to cherry-pick a PR's commits to multiple branches.
Use the git cherry-pick operation to apply changes to another
branch. A new topic branch will be created with the applied changes
and, if the pull request option is selected, a pull request will be
opened to the target branch

<img width="430" alt="Screen Shot 2019-05-10 at 3 36 50 PM" src="https://user-images.githubusercontent.com/19557880/57560677-63bbe100-733c-11e9-8154-9fa920e4afa3.png"><img width="431" alt="Screen Shot 2019-05-10 at 3 37 40 PM" src="https://user-images.githubusercontent.com/19557880/57560679-674f6800-733c-11e9-8cc1-797b8d88bef6.png">

## Tech

- Code written in Typescript/Styling defined using SASS
- Webpack for watching and building files during development, and for building optimized bundles for production
- React for rendering a complex UI with user interaction

## Onboarding

1. Install the extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=1eslighthouseinternal.pr-multi-cherry-pick-dev&ssr=false#overview) into your Azure DevOps organization.
2. Navigate to your Pull Request
3. Next to the Complete button, select the drop down button with three dots
4. Click on Multi-Cherry-pick

<img width="409" alt="Screen Shot 2019-05-10 at 4 20 10 PM" src="https://user-images.githubusercontent.com/19557880/57596172-1a1af400-74fe-11e9-8c0d-18291d20590a.png">

## How to build

### Prerequisites: Node and NPM

**Windows and Mac OSX**: Download and install node from [nodejs.org](http://nodejs.org/)

**Linux**: Install [using package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)

From a terminal ensure at least node 4.2 and npm 6. Use the following command to figure out what version you have installed locally:

```bash
node -v && npm -v
```

The folliwng should should appear in your terminal:

```bash
v4.2.0
5.6.0
```

To install npm separately and verify that it installed properly:

```
[sudo] npm install npm@6 -g
npm -v
```

Note: On Windows, if it's still returning npm 2.x, run `where npm`. Notice hits in program files. Rename those two npm files and the 5.6.0 in AppData will win.

### Install Dependencies

Run this command once:

```bash
npm install
```

### Building

This extension uses _webpack_ for bundling, _webpack-dev-server_ for watching files and serving bundles during development.

Two bundles are defined for webpack, one for the main dialog, one for the extension context menu registration.

All actions can be triggered using npm scripts (`npm run <target>`), no additional task runner required.

### Development

1. Run `npm run publish:dev` to publish the current extension manifest to the marketplace as a private extension with a suffix of `-dev` added to the extension id. This package will use a baseUri of `https://localhost:3000`.

2. Run `npm run start:dev` to start a webpack development server that watches all source files.

### Production

1. Run `npm run publish:release` to compile all modules into bundles, package them into a .vsix, and publish as a _public_ extension to the VSTS marketplace.

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
