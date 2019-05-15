import "./common.scss";
import * as SDK from "azure-devops-extension-sdk";
import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import * as Spinner from "react-spinkit";
import { showRootComponent } from "./common";
import { SummaryComponent } from "./Components/summaryTable";
import { FormView } from "./Components/formView";
import {
  CreatePullRequestAsync,
  CherryPickCommitsAsync,
  ValidateTargetBranchesAsync
} from "./services/cherryPickService";
import { ICherryPickTarget, IResult, IRestClientResult } from "./interfaces";
import { GitPullRequest } from "azure-devops-extension-api/Git";
import { formatCherryPickUrl, formatPrUrl } from "./utilities";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { Guid, findIndex, checkValuesPopulated } from "./utilities";

interface IDialogState {
  pullRequest?: GitPullRequest;
  results?: IResult[];
  loading?: boolean;
  ready?: boolean;
  targets: ICherryPickTarget[];
  errors: boolean;
  buttonDisabled: boolean;
}

class DialogContent extends React.Component<{}, IDialogState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      targets: this.initialTarget,
      errors: false,
      buttonDisabled: true
    };
  }
  private initialTarget: ICherryPickTarget[] = [
    {
      id: Guid.newGuid(),
      targetBranch: "",
      topicBranch: "",
      createPr: true,
      error: false,
      errorMessage: "",
      selection: new DropdownSelection()
    }
  ];

  private spinner = React.createElement(Spinner as any, {
    name: "three-bounce",
    fadein: "quarter",
    className: "saving-indicator"
  });

  public async componentDidMount() {
    SDK.init();

    await SDK.ready();

    const config = SDK.getConfiguration();
    const pr = config.pullRequest;

    this.setState({
      pullRequest: pr,
      ready: true
    });

    SDK.notifyLoadSucceeded().then(() => {
      SDK.resize();
    });
  }

  updateTargets = (newTargets: ICherryPickTarget[]) => {
    const emptyValues = checkValuesPopulated(newTargets);
    this.setState({
      targets: newTargets,
      buttonDisabled: emptyValues
    });
  };

  turnOnErrorMessage = (id: string, errorMessage: string) => {
    const rowIndex = findIndex(id, this.state.targets);

    this.setState(prevState => {
      prevState.targets[rowIndex].errorMessage = errorMessage;
      prevState.targets[rowIndex].error = true;
      return prevState;
    });
    this.setState({
      errors: true
    });
  };

  turnOffErrorMessage = (id: string) => {
    const rowIndex = findIndex(id, this.state.targets);

    this.setState(prevState => {
      prevState.targets[rowIndex].errorMessage = "";
      prevState.targets[rowIndex].error = false;
      return prevState;
    });
    this.setState({
      errors: false
    });
  };

  dismiss(useValue: boolean) {
    const result = undefined;
    const config = SDK.getConfiguration();
    if (config.dialog) {
      config.dialog.close(result);
    } else if (config.panel) {
      config.panel.close(result);
    }
  }

  async processTargetAsync(
    target: ICherryPickTarget,
    pullRequestContext: GitPullRequest
  ): Promise<IResult> {
    try {
      const result: IResult = {};
      const { pullRequest } = this.state;

      // Create cherry-pick
      const cherryPickResult = await CherryPickCommitsAsync(
        pullRequestContext,
        target.topicBranch,
        target.targetBranch
      );

      if (cherryPickResult.error || !cherryPickResult.result) {
        result.error =
          cherryPickResult.error ||
          `Unable to cherry-pick to ${target.topicBranch}`;
        return result;
      }

      result.cherryPick = cherryPickResult.result;
      result.cherryPickUrl = formatCherryPickUrl(cherryPickResult.result);

      // If !CreatePr -> continue to next target
      if (!target.createPr) {
        return result;
      }

      const createdPrResult = await CreatePullRequestAsync(
        cherryPickResult.result,
        pullRequestContext,
        target.topicBranch,
        target.targetBranch
      );

      if (createdPrResult.error || !createdPrResult.result) {
        result.error =
          createdPrResult.error || "Was not able to complete the PR";
        return result;
      }

      result.pullRequest = createdPrResult.result;
      result.pullRequestUrl = formatPrUrl(createdPrResult.result);

      result.errorExists = false;
      return result;
    } catch (ex) {
      console.error(ex);
      return {};
    }
  }

  onCreate = async () => {
    const { pullRequest, ready } = this.state;

    this.setState({
      loading: true
    });

    if (!this.state.targets || !pullRequest) {
      return;
    }

    let allValid = true;
    for (const target of this.state.targets) {
      const isValid = await ValidateTargetBranchesAsync(
        pullRequest.repository,
        target.topicBranch,
        target.targetBranch
      );

      if (isValid.error || !isValid.result) {
        allValid = false;
        this.turnOnErrorMessage(
          target.id,
          isValid.error || "Target branch or topic branch is invalid"
        );
      } else {
        this.turnOffErrorMessage(target.id);
      }
    }

    if (!allValid) {
      this.setState({ loading: false });
      return;
    }

    const results: IResult[] = [];
    for (const target of this.state.targets) {
      const result = await this.processTargetAsync(target, pullRequest);
      results.push(result);
    }

    this.setState({
      loading: false,
      results: results
    });
  };

  public render(): JSX.Element {
    const {
      pullRequest,
      ready,
      loading,
      results,
      errors,
      buttonDisabled
    } = this.state;

    if (loading || !ready) {
      // Show loading dialog
      return (
        <div className="saving-indicator-container">
          <div>{this.spinner}</div>
        </div>
      );
    } else if (results && !errors) {
      // Show summary view
      return (
        <div className="sample-panel flex-column flex-grow">
          <div className="flex-grow scroll-content">
            <SummaryComponent results={results} />
          </div>

          <ButtonGroup className="sample-panel-button-bar">
            <Button
              className="dialog-button"
              primary={true}
              text="OK"
              onClick={() => this.dismiss(true)}
            />
          </ButtonGroup>
        </div>
      );
    } else {
      // Show form view
      return (
        <div className="sample-panel flex-column flex-grow">
          <div className="flex-grow scroll-content">
            <FormView
              targets={this.state.targets}
              updateTargets={this.updateTargets}
              pullRequest={this.state.pullRequest!}
            />
          </div>
          <ButtonGroup className="sample-panel-button-bar">
            <Button
              className="dialog-button"
              text="Cancel"
              onClick={() => this.dismiss(false)}
            />
            <Button
              className="dialog-button"
              primary={true}
              disabled={buttonDisabled}
              text="Complete"
              onClick={() => this.onCreate()}
            />
          </ButtonGroup>
        </div>
      );
    }
  }
}

showRootComponent(<DialogContent />);
