# Multi Cherry-Pick Tool

This tool offers an easy way to use the git cherry-pick operation to apply changes to multiple branches.
For each branch indicated, a new topic branch will be created with the applied changes.
If the **Pull request** option is selected, a pull request will be opened to the target branch.

<img width="434" alt="Screen Shot 2019-05-13 at 1 00 27 PM" src="https://user-images.githubusercontent.com/19557880/57650379-87229e00-757f-11e9-8966-e00bb5416c8f.png"><img width="436" alt="Screen Shot 2019-05-13 at 1 00 46 PM" src="https://user-images.githubusercontent.com/19557880/57650380-87229e00-757f-11e9-9143-549002959cea.png">

## Quick steps to get started using the tool

1. Install the extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=1eslighthouseinternal.pr-multi-cherry-pick-dev&ssr=false#overview) into your Azure DevOps organization.
2. Navigate to your pull request.
3. Select the context menu (...)
4. Select Multi cherry-pick.

<img width="409" alt="Screen Shot 2019-05-10 at 4 20 10 PM" src="https://user-images.githubusercontent.com/19557880/57596172-1a1af400-74fe-11e9-8c0d-18291d20590a.png">

5. Add as many target branches as you would like using the <img width="45" alt="Screen Shot 2019-05-13 at 1 22 10 PM" src="https://user-images.githubusercontent.com/19557880/57651487-2e083980-7582-11e9-8cbf-13faeeb5b0a0.png"> button.
6. The **Complete** button will not enable until you have selected a target branch and populated the topic branch field for each row.
7. An error will appear if you select a name for a target topic branch that already exists.
8. Once all the fields have been validated and you select the **Complete button**, you will be taken to a summary page that will describe if the corresponding PR/branch creation was successful.
9. For each successful PR/branch, its location is hyperlinked on the summary page.

## Learn more about developing and testing this extension

The [source](https://github.com/microsoft/azure-repos-pr-multi-cherry-pick) to this extension is available. Feel free to take, fork, and extend.

> Microsoft DevLabs is an outlet for experiments from Microsoft, experiments that represent some of the latest ideas around developer tools. Solutions in this category are designed for broad usage, and you are encouraged to use and provide feedback on them; however, these extensions are not supported nor are any commitments made as to their longevity.

## Technoliges used to devlop

- Code written in Typescript; styling defined using SASS.
- Webpack for watching and building files during development, and for building optimized bundles for production.
- React for rendering a complex UI with user interaction.

## How to build

### **Download the required tools**

You will need:

- [Visual Studio Code](https://code.visualstudio.com/download)
- [Firefox](https://www.mozilla.org/firefox/) (the VS Code Debugger for Chrome extension [doesn’t support iframes](https://github.com/microsoft/vscode-chrome-debug/issues/786) yet)
- [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-firefox-debug) VS Code extension

### **Prerequisite: Organization Permission Level**

- To develop and test the extension you will neeed an organization where you have permission to install extensions to (i.e. you are the owner).
- If you don't have a personal organization, you can [create an organization for free](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops).

### **Prerequisite: Node and NPM**

- **Windows and Mac OSX**: Download and install node from [nodejs.org](http://nodejs.org/).

- **Linux**: Install [using package manager](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager).

From a terminal ensure at least node 10.15 and npm 6.9. Use the following command to figure out what version you have installed locally:

```bash
node -v && npm -v
```

The following should appear in your terminal:

```bash
v10.15.0
6.9.0
```

To install npm separately and verify that it installed properly:

```
[sudo] npm install npm@6 -g
npm -v
```

Note: On Windows, if it's still returning npm 2.x, run `where npm`. Notice hits in program files. Rename those two npm files and the 5.6.0 in AppData will win.

### **Prerequisite: Create a publisher**

All extensions, including extensions from Microsoft, live under a publisher. Anyone can create a publisher and publish extensions under it. You can also give other people access to your publisher if a team is developing the extension.

You will do one of two things:

- Sign in to the Visual Studio Marketplace management portal
- If you don't already have a publisher, you'll be prompted to create one. Learn how to create one [here](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops)

### **Install Dependencies**

Run this command once:

```bash
npm install
```

### **Building**

This extension uses webpack for bundling, webpack-dev-server for watching files and serving bundles during development.
Two bundles are defined for webpack, one for the main dialog, one for the extension context menu registration.
All actions can be triggered using npm scripts (`npm run <target>`), no additional task runner required.

### **Development- deploy your dev extension to Azure DevOps**

You will need to deploy your extension to the marketplace at least once so that you can share it with your desired organization
and install it. In order to do this you will need to generate a Personal Access Token(PAT), learn how to do that [here](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops). When creating your PAT be sure to select All accessible organizations under **Organization** and that the **Marketplace** scope is set to Publish.

Then run once, inserting your PAS into [token]:

```bash
npm run publish:dev --  --token [token]
```

You will then need to install and share your extension, learn how to do that [here](https://docs.microsoft.com/en-us/azure/devops/extend/get-started/node?toc=%2Fazure%2Fdevops%2Fextend%2Ftoc.json&bc=%2Fazure%2Fdevops%2Fextend%2Fbreadcrumb%2Ftoc.json&view=azure-devops#install-your-extension).

Once the extension is installed, you will notice that it won’t load correctly. It isn't loading because we configured it to load all its resources (html, images, etc.) from `localhost:3000`, but there is no server running yet.

To start webpack-dev-server run:

```bash
npm run start:dev
```

Now if you go to `localhost:3000` in your browser, you should get an untrusted certificate error page. Click on advanced and then trust the certificate. Go back to Azure DevOps and your extension should now load correctly and any changes to the source code will cause webpack to recompile and reload the extension automatically.

Although most code changes will be reflected immediately, you may still need to occasionally update your extension in the marketplace. The dev extension loads all its resources from the webpack-dev-server, but the manifest itself is being loaded from the published code. Therefore, any changes to the manifest file will not be properly reflected in Azure DevOps until the extension has been republished.

### **Configure your VS Code project to debug against Azure DevOps**

Hit F5 in VS Code to start debugging (making sure the webpack-dev-server is still running). The default launch configuration should be set to Firefox. Chrome configurations are included in the sample as well in case the Chrome debugging extension eventually supports iframes. However, debugging iframes is only supported in the Debugger for Firefox extension for now.

Once Firefox starts up, you will have to go through the steps of allowing the `localhost:3000` certificate again and log into your Azure DevOps account. From now on, if you leave this Firefox window open, the debugger will reattach instead of starting a clean Firefox instance each time.

Once you are logged in to Azure DevOps, your extension should be running. Set a breakpoint in a method in VS Code and you should see that breakpoint hit when that method executes.

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
