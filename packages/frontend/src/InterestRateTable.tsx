import { default as _ } from "lodash-es";
import { useReducer } from "react";
import { Table } from "semantic-ui-react";
import { InterestRateEntry } from "./types";

interface BankEntry {
  id: string;
  name: string;
  location: string;
  rate: string;
  baseDate: string | null;
}

interface State {
  column: string | null;
  direction: "ascending" | "descending" | undefined;
  data: BankEntry[];
}

type Action = {
  type: "CHANGE_SORT";
  column: string;
};

function exampleReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CHANGE_SORT":
      if (state.column === action.column) {
        return {
          ...state,
          data: state.data.slice().reverse(),
          direction:
            state.direction === "ascending" ? "descending" : "ascending",
        };
      }

      return {
        column: action.column,
        data: _.sortBy(state.data, [action.column]),
        direction: "ascending",
      };
    default:
      throw new Error();
  }
}

export function InteresetRateTable(props: { tableData: BankEntry[] }) {
  const [state, dispatch] = useReducer(exampleReducer, {
    column: null,
    data: props.tableData,
    direction: undefined,
  });
  const { column, data, direction } = state;

  return (
    <>
      <p>
        금리 높은 항목 {data.length}개를 표시합니다. 우대 금리가 적용되지 않은
        기본값입니다.
        <a href="https://www.kfcc.co.kr/map/main.do">금고위치안내</a>에서 조회한
        결과와 MG더뱅킹 앱에서 보이는 것은 다를 수 있습니다.
      </p>
      <Table sortable compact selectable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>금고ID</Table.HeaderCell>
            <Table.HeaderCell>이름</Table.HeaderCell>
            <Table.HeaderCell>지역</Table.HeaderCell>
            <Table.HeaderCell
              sorted={column === "rateA" ? direction : undefined}
              onClick={() => dispatch({ type: "CHANGE_SORT", column: "rateA" })}
            >
              금리 (1년)
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((entry, idx) => {
            const params = new URLSearchParams();
            params.set("gmgoCd", entry.id);
            params.set("name", entry.name);
            params.set("divCd", "001");
            params.set("code1", entry.id);
            params.set("code2", "001");
            params.set("tab", "sub_tab_rate");
            const url = `https://www.kfcc.co.kr/map/view.do?${params.toString()}`;

            return (
              <Table.Row key={entry.id}>
                <Table.Cell>
                  <a href={url} target="_blank">{entry.id}</a>
                </Table.Cell>
                <Table.Cell>{entry.name}</Table.Cell>
                <Table.Cell>{entry.location}</Table.Cell>
                <Table.Cell>{entry.rate} %</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
}
