# Multi Cherry-Pick Tool

[![Build Status](https://dev.azure.com/1es-cat/azure-repos-pr-multi-cherry-pick/_apis/build/status/microsoft.azure-repos-pr-multi-cherry-pick?branchName=master)](https://dev.azure.com/1es-cat/azure-repos-pr-multi-cherry-pick/_build/latest?definitionId=24&branchName=master)
[![Release Status](https://vsrm.dev.azure.com/1es-cat/_apis/public/Release/badge/a185aa03-7d78-4c7d-b5fb-f7d997b096f9/1/1)](https://dev.azure.com/1es-cat/azure-repos-pr-multi-cherry-pick/_release?definitionId=1)

This tool offers an easy way to use the git cherry-pick operation to apply changes to multiple branches.
For each branch selected, a new topic branch will be created with the applied changes.
If the **Pull request** option is selected, a pull request will be opened to the target branch.

<img width="434" alt="Screen Shot 2019-05-13 at 1 00 27 PM" src="https://user-images.githubusercontent.com/19557880/57650379-87229e00-757f-11e9-8966-e00bb5416c8f.png"><img width="436" alt="Screen Shot 2019-05-13 at 1 00 46 PM" src="https://user-images.githubusercontent.com/19557880/57650380-87229e00-757f-11e9-9143-549002959cea.png">

## Quick steps to get started using the tool

1. Install the extension from the [marketplace](https://marketplace.visualstudio.com/items?itemName=1ESLighthouseEng.pr-multi-cherry-pick) into your Azure DevOps organization.
2. Navigate to your pull request.
3. Select the context menu (...)
4. Select **Multi-cherry-pick**.

<p style="padding-left:25px">
<img width="409" alt="Screen Shot 2019-05-10 at 4 20 10 PM" src="https://user-images.githubusercontent.com/19557880/57596172-1a1af400-74fe-11e9-8c0d-18291d20590a.png">
</p>

5. Add as many cherry-pick targets as you would like.
6. After you click **Complete**, a summary page will appear with links to branches and PRs created from the tool.

## Technologies used to develop the extension

- Code written in Typescript; styling defined using SASS.
- Webpack for watching and building files during development, and for building optimized bundles for production.
- React for rendering a complex UI with user interaction.

## How to build

### **Download the required tools**

You will need:

- [Visual Studio Code](https://code.visualstudio.com/download)
- [Firefox](https://www.mozilla.org/firefox/) (the VS Code Debugger for Chrome extension [doesn’t support iframes](https://github.com/microsoft/vscode-chrome-debug/issues/786) yet)
- The [Debugger for Firefox](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-firefox-debug) VS Code extension

### **Prereq: Organization permission level**

- To develop and test the extension, you will need an organization in which you have permission to install extensions (e.g. you are the owner).
- If you don't have a personal organization, you can [create an organization for free](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/create-organization?view=azure-devops).

### **Prereq: Node and NPM**

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

**Note:** On Windows, if it's still returning npm 2.x, run `where npm`. Notice hits in program files. Rename those two npm files and the 5.6.0 in AppData will win.

### **Prereq: Create a publisher**

All extensions, including extensions from Microsoft, live under a publisher. Anyone can create a publisher and publish extensions under it. You can also give other people access to your publisher if a team is developing the extension.

You will do one of two things:

- Sign in to the Visual Studio Marketplace management portal
- If you don't already have a publisher, you'll be prompted to create one. Learn how to create one [here](https://docs.microsoft.com/en-us/azure/devops/extend/publish/overview?view=azure-devops)

### **Install dependencies**

Run this command once:

```bash
npm install
```

### **Build the Extension**

This extension uses webpack for bundling and webpack-dev-server for watching files and serving bundles during development.
Two bundles are defined for webpack: one for the main dialog and one for the extension context menu registration.
All actions can be triggered using npm scripts (`npm run <target>`) with no additional task runner required.

### **Deploy the Extension**

You will need to deploy your extension to the marketplace at least once so that you can share it with your organization
and install it. In order to do this, you will need to generate a personal access token (PAT). Learn how to do that [here](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops). When creating your PAT, under **Organization**, select **All accessible organizations**, and set the **Marketplace** scope to **Publish**.

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

Now if you go to `localhost:3000` in your browser, you should get an untrusted certificate error page. Select **Advanced** and then trust the certificate. Go back to Azure DevOps and your extension should now load correctly and any changes to the source code will cause webpack to recompile and reload the extension automatically.

Although most code changes will be reflected immediately, you may still need to occasionally update your extension in the marketplace. The dev extension loads all its resources from the webpack-dev-server, but the manifest itself is being loaded from the published code. Therefore, any changes to the manifest file will not be properly reflected in Azure DevOps until the extension has been republished.

### **Configure your VS Code project to debug against Azure DevOps**

In VS Code, press **F5** to start debugging (making sure the webpack-dev-server is still running). The default launch configuration should be set to **Firefox**. 

**Note**: Chrome configurations are included in the sample as well in case the Chrome debugging extension eventually supports iframes. However, debugging iframes is only supported in the Debugger for Firefox extension for now.

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
