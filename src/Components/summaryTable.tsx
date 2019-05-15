import "./../common.scss";

import * as React from "react";

import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";
import { Icon } from "azure-devops-ui/Icon";

import { IResult } from "../interfaces";
import {
  Table,
  ITableColumn,
  TableCell,
  TwoLineTableCell
} from "azure-devops-ui/Table";
import { Status, StatusSize, Statuses } from "azure-devops-ui/Status";
import { Link } from "azure-devops-ui/Link";
import { trimStart } from "../utilities";
import { Tooltip } from "azure-devops-ui/TooltipEx";
import { IHostNavigationService } from "azure-devops-extension-api";

interface Props {
  results: IResult[];
}
export class SummaryComponent extends React.Component<Props> {
  private itemProvider = new ArrayItemProvider<IResult>(this.props.results);
  private navService: IHostNavigationService | undefined;

  public render(): JSX.Element {
    return (
      <div>
        <Table<Partial<IResult>>
          columns={this.columns}
          itemProvider={this.itemProvider}
          showLines={true}
        />
      </div>
    );
  }

  renderIconColumn = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IResult>,
    tableItem: IResult
  ): JSX.Element => {
    return (
      <TableCell
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        className="fontWeightSemiBold font-weight-semibold fontSizeM font-size-m scroll-hidden"
        key={"col-" + columnIndex}
      >
        <div className="list-example-row flex-row h-scroll-hidden">
          {tableItem.error ? (
            <Status
              {...Statuses.Failed}
              key="failed"
              size={StatusSize.l}
              className="status-example flex-self-center "
            />
          ) : (
            <Status
              {...Statuses.Success}
              key="success"
              size={StatusSize.l}
              className="status-example flex-self-center "
            />
          )}
        </div>
      </TableCell>
    );
  };

  renderStatusColumn = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IResult>,
    tableItem: IResult
  ): JSX.Element => {
    if (tableItem.error) {
      return this.getErrorRow(rowIndex, columnIndex, tableColumn, tableItem);
    }
    return this.getSuccessRow(rowIndex, columnIndex, tableColumn, tableItem);
  };

  getSuccessRow = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IResult>,
    item: IResult
  ): JSX.Element => {
    return (
      <TwoLineTableCell
        className="bolt-table-cell-content-with-inline-link summary-row"
        key={"col-" + columnIndex}
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        line1={
          <span className="flex-row scroll-hidden">
            {item.pullRequest
              ? "Cherry-pick and pull request created successfully"
              : "Cherry-pick and branch created successfully"}
          </span>
        }
        line2={
          <span className="font-size-ms secondary-text flex-row flex-center">
            {item.pullRequest && (
              <Link
                className="monospaced-text flex-row flex-center bolt-table-link bolt-table-inline-link"
                excludeTabStop
                href={item.pullRequestUrl}
                target="_blank"
              >
                {Icon({
                  className: "icon-margin",
                  iconName: "BranchPullRequest",
                  key: "pull-request"
                })}
                {`PR ${item.pullRequest!.pullRequestId}`}
              </Link>
            )}

            <Link
              className="monospaced-text flex-row flex-center bolt-table-link bolt-table-inline-link multi-line-td"
              excludeTabStop
              href={item.cherryPickUrl}
              target="_blank"
            >
              {Icon({
                className: "icon-margin",
                iconName: "OpenSource",
                key: "branch-name"
              })}
              {trimStart(
                item.cherryPick!.parameters.generatedRefName,
                "refs/heads/"
              )}
            </Link>
          </span>
        }
      />
    );
  };

  getErrorRow = (
    rowIndex: number,
    columnIndex: number,
    tableColumn: ITableColumn<IResult>,
    item: IResult
  ): JSX.Element => {
    return (
      <TwoLineTableCell
        className="bolt-table-cell-content-with-inline-link summary-row"
        key={"col-" + columnIndex}
        columnIndex={columnIndex}
        tableColumn={tableColumn}
        line1={
          <span className="flex-row scroll-hidden">
            Error processing the request
          </span>
        }
        line2={
          <div className="font-size-ms text-ellipsis secondary-text monospaced-text flex-row flex-center scroll-hidden multi-line-td">
            <Tooltip overflowOnly={true}>
              <span>{item.error}</span>
            </Tooltip>
          </div>
        }
      />
    );
  };

  private columns: ITableColumn<IResult>[] = [
    {
      id: "icon",
      width: 44,
      renderCell: this.renderIconColumn
    },
    {
      id: "name",
      width: -100,
      renderCell: this.renderStatusColumn
    }
  ];
}
