import "../common.scss";

import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { Observer } from "azure-devops-ui/Observer";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { Guid } from "../utilities";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ICherryPickTarget } from "../interfaces";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { GroupedItemProvider } from "azure-devops-ui/Utilities/GroupedItemProvider";
import { IMenuItem } from "azure-devops-ui/Menu";
import { FormItem } from "azure-devops-ui/FormItem";
import { HeaderDescription } from "azure-devops-ui/Header";

import {
  IListBoxItem,
  LoadingCell,
  ListBoxItemType
} from "azure-devops-ui/ListBox";
import { IListSelection } from "azure-devops-ui/List";
import { trimStart, findIndex } from "../utilities";

import {
  ITableColumn,
  TableColumnLayout,
  SimpleTableCell,
  Table,
  ColumnMore
} from "azure-devops-ui/Table";

import { GetAllBranchesAsync } from "../services/gitBranchService";
import { GitPullRequest } from "azure-devops-extension-api/Git";
import { ButtonGroup } from "azure-devops-ui/ButtonGroup";
import { Icon } from "azure-devops-ui/Icon";

interface Props {
  targets: ICherryPickTarget[];
  pullRequest: GitPullRequest;
  updateTargets: (newTargets: ICherryPickTarget[]) => void;
}

interface FormState {
  loading: ObservableValue<boolean>;
  test: boolean;
}

export class FormView extends React.Component<Props, FormState> {
  constructor(props: any) {
    super(props);
    this.state = {
      loading: new ObservableValue<boolean>(false),
      test: true
    };
  }

  componentWillReceiveProps(prevProps: Props, prevState: FormState) {
    if (prevProps.targets !== this.props.targets) {
      this.setState({
        //test: true
      });
    }
  }

  addItem = () => {
    const newTarget = {
      id: Guid.newGuid(),
      targetBranch: "",
      topicBranch: "",
      createPr: true,
      error: false,
      errorMessage: "",
      selection: new DropdownSelection()
    };

    let newTargets = this.props.targets.splice(0);
    newTargets.push(newTarget);
    this.props.updateTargets(newTargets);
  };

  removeItem = (id: string) => (menuItem: IMenuItem, event?: any) => {
    const rowIndex = findIndex(id, this.props.targets);

    if (rowIndex != 0 || this.props.targets.length > 1) {
      let newTargets = this.props.targets.splice(0);
      newTargets.splice(rowIndex, 1);
      this.props.updateTargets(newTargets);
    }
  };

  handlePRChange = (id: string) => (event: any, checked: boolean) => {
    const rowIndex = findIndex(id, this.props.targets);
    let newTargets = this.props.targets.splice(0);

    newTargets[rowIndex].createPr = checked;
    this.props.updateTargets(newTargets);
  };

  handleInputTopicText = (newValue: string, id: string) => {
    const rowIndex = findIndex(id, this.props.targets);
    let newTargets = this.props.targets.splice(0);

    newTargets[rowIndex].topicBranch = newValue;
    newTargets[rowIndex].error = false;
    newTargets[rowIndex].errorMessage = "";
    this.props.updateTargets(newTargets);
  };

  handleDropdownChange = (newValue: IListBoxItem<{}>, id: string) => {
    const { targets } = this.props;
    const rowIndex = findIndex(id, targets);
    const targetBranchName = newValue.text || "";
    let generatedTopicBranchName = trimStart(
      `${this.props.pullRequest.sourceRefName}-on-${targetBranchName}`,
      "refs/heads/"
    );

    let count = 1;
    while (
      targets.some(target => target.topicBranch === generatedTopicBranchName)
    ) {
      generatedTopicBranchName = trimStart(
        `${
          this.props.pullRequest.sourceRefName
        }-on-${targetBranchName}-${count}`,
        "refs/heads/"
      );
      count++;
    }

    const newTargets = this.props.targets.splice(0);

    newTargets[rowIndex].targetBranch = targetBranchName;
    newTargets[rowIndex].topicBranch = generatedTopicBranchName;

    this.props.updateTargets(newTargets);
  };

  loadingItem: IListBoxItem = {
    id: "loading",
    type: ListBoxItemType.Loading,
    render: (
      rowIndex: number,
      columnIndex: number,
      tableColumn: ITableColumn<IListBoxItem<{}>>,
      tableItem: IListBoxItem<{}>
    ) => {
      return (
        <LoadingCell
          key={tableItem.id}
          columnIndex={columnIndex}
          tableColumn={tableColumn}
          tableItem={tableItem}
          onMount={this.onLoadingMount}
        />
      );
    }
  };

  private itemProviderGrouped = new GroupedItemProvider(
    [this.loadingItem],
    [],
    false
  );

  renderDropdownRow = <T extends {}>(
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IListBoxItem<T>>,
    tableItem: IListBoxItem<T>
  ): JSX.Element => {
    // If there's no path separator, this will return -1
    const lastIndex = tableItem.text!.lastIndexOf("/");
    // If this is -1, branch folder will just be an empty string
    const branchFolder = tableItem.text!.substring(0, lastIndex + 1);
    const branchName = tableItem.text!.substring(lastIndex + 1);

    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        contentClassName="font-size-m scroll-hidden text-ellipsis"
      >
        {Icon({
          className: "icon-margin",
          iconName: "OpenSource",
          key: "branch-name"
        })}
        <span className="branch-folder">{branchFolder}</span>
        <span className="branch-name">{branchName}</span>
      </SimpleTableCell>
    );
  };

  private onLoadingMount = async () => {
    if (!this.state.loading.value) {
      // Set loading to true once we start fetching items, this will announce
      // that loading has begun to screen readers.
      this.state.loading.value = true;

      //remove the loading item
      this.itemProviderGrouped.pop();
      var groupNames = ["Default", "Favorites", "All"];

      const branches = await GetAllBranchesAsync(
        this.props.pullRequest.repository
      );

      const dropdownItems: IListBoxItem<{}>[] = [];

      for (let i = 0; i < groupNames.length; i++) {
        const groupId = i.toString();
        const groupName = groupNames[i];
        const groupBranches = branches.get(groupName);
        if (!groupBranches) {
          continue;
        }

        if (i > 0) {
          dropdownItems.push({
            id: `${i}-divider`,
            type: ListBoxItemType.Divider,
            groupId: groupId
          });
        }

        dropdownItems.push(
          ...[
            {
              id: `${groupId}-header`,
              text: groupName,
              type: ListBoxItemType.Header,
              groupId: groupId
            },
            ...groupBranches.map(x => {
              return {
                id: x,
                text: trimStart(x, "refs/heads/"),
                groupId: groupId,
                iconProps: { iconName: "OpenSource" },
                render: this.renderDropdownRow
              };
            })
          ]
        );
      }

      // Add items to provider
      this.itemProviderGrouped.change(0, ...dropdownItems);

      // Set loading to false to announce how many items have loaded to screen readers.
      this.state.loading.value = false;
    }
  };

  private selection = new DropdownSelection();

  retrevePreviousDropdown = (
    selection: IListSelection,
    items: IListBoxItem<{}>[],
    tableItem: ICherryPickTarget
  ) => {
    return (
      (items[selection.value[0].beginIndex] &&
        items[selection.value[0].beginIndex].text) ||
      tableItem.targetBranch
    );
  };

  renderFormColumn = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<ICherryPickTarget>,
    tableItem: ICherryPickTarget
  ): JSX.Element => {
    return (
      <SimpleTableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        key={"col-" + columnIndex}
        contentClassName="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden cherry-pick-container"
      >
        <table className="cherry-pick-table">
          <tbody>
            <tr className="cherry-pick-row">
              <td className="cherry-pick-text">Target branch:</td>
              <td className="cherry-pick-row">
                <div className="scroll-hidden" key={tableItem.id}>
                  <Tooltip overflowOnly={true} key={tableItem.id}>
                    <Observer selection={tableItem.selection}>
                      {() => {
                        return (
                          <Dropdown
                            key={tableItem.id}
                            items={this.itemProviderGrouped}
                            loading={this.state.loading}
                            placeholder="Select a branch"
                            filteredNoResultsText="No matching branch names found."
                            onSelect={(e, newValue) =>
                              this.handleDropdownChange(newValue, tableItem.id)
                            }
                            renderSelectedItems={(selection, items) =>
                              this.retrevePreviousDropdown(
                                selection,
                                items,
                                tableItem
                              )
                            }
                            selection={tableItem.selection}
                          />
                        );
                      }}
                    </Observer>
                  </Tooltip>
                </div>
              </td>
            </tr>

            <tr className="cherry-pick-row">
              <td className="cherry-pick-text">Topic branch:</td>
              <td className="cherry-pick-row">
                <FormItem
                  message={tableItem.errorMessage}
                  error={tableItem.error}
                >
                  <TextField
                    value={tableItem.topicBranch}
                    onChange={(e, newValue) =>
                      this.handleInputTopicText(newValue, tableItem.id)
                    }
                    placeholder="type here..."
                    width={TextFieldWidth.auto}
                  />
                </FormItem>
              </td>
            </tr>

            <tr className="cherry-pick-row">
              <td className="cherry-pick-text">Pull Request:</td>
              <td className="cherry-pick-row">
                <Checkbox
                  onChange={this.handlePRChange(tableItem.id)}
                  checked={tableItem.createPr}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </SimpleTableCell>
    );
  };

  private asyncColumns: ITableColumn<ICherryPickTarget>[] = [
    {
      columnLayout: TableColumnLayout.none,
      id: "entryFields",
      renderCell: this.renderFormColumn,
      width: -100
    },
    new ColumnMore(target => {
      return {
        id: "sub-menu",
        items: [
          {
            id: "remove-submenu",
            text: "Remove",
            onActivate: this.removeItem(target.id)
          }
        ]
      };
    })
  ];

  public render(): JSX.Element {
    var currentTargets = new ArrayItemProvider(this.props.targets);

    return (
      <div className="sample-panel flex-column flex-grow">
        <div className="page-content page-content-top">
          <HeaderDescription className="main-description">
            Use the git cherry-pick operation to apply changes to another
            branch. A new topic branch will be created with the applied changes
            and, if the pull request option is selected, a pull request will be
            opened to the target branch
          </HeaderDescription>
          <Observer>
            <Table<ICherryPickTarget>
              columns={this.asyncColumns}
              itemProvider={currentTargets}
            />
          </Observer>
          <ButtonGroup className="sample-panel-button-bar">
            <Button
              className="dialog-button"
              onClick={this.addItem}
              iconProps={{
                iconName: "Add",
                className: "font-weight-heavy fontSizeL"
              }}
            />
          </ButtonGroup>
        </div>
      </div>
    );
  }
}
