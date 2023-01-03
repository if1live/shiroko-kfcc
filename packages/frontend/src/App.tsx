import { default as _ } from "lodash-es";
import { useState } from "react";
import {
  Container,
  Header,
  Menu,
  MenuItemProps,
  Image,
} from "semantic-ui-react";
import shirokoBanner from "./assets/shiroko-banner.png";
import { Help } from "./Help";
import { InteresetRateTable } from "./InterestRateTable";
import { InterestRateEntry } from "./types";

function App(props: { tableData: InterestRateEntry[] }) {
  const { tableData } = props;

  const [activeItem, setActiveItem] = useState("MG더뱅킹정기예금");

  const baseDate = tableData[0].baseDate;

  const topRange = 200;
  const filterByCategory = (key: keyof InterestRateEntry) => {
    // 데이터를 많이 줘도 로딩만 느릴뿐. 어차피 안볼거다
    return tableData
      .filter((x) => x[key] != null)
      .map((x) => {
        const { rateA, rateB, rateC, ...rest } = x;
        return { ...rest, rate: x[key]! };
      })
      .sort((a, b) => b.rate.localeCompare(a.rate))
      .slice(0, topRange);
  };

  const entriesA = filterByCategory("rateA");
  const entriesB = filterByCategory("rateB");
  const entriesC = filterByCategory("rateC");

  const handleItemClick = (e: React.MouseEvent, data: MenuItemProps) => {
    setActiveItem(data.name!);
  };

  return (
    <Container>
      <Header as="h1">Shiroko: MG새마을금고 금리 조회</Header>

      <Image src={shirokoBanner} size="big" />

      <Menu pointing secondary>
        <Menu.Item
          name="MG더뱅킹정기예금"
          active={activeItem === "MG더뱅킹정기예금"}
          onClick={handleItemClick}
        />
        <Menu.Item
          name="MG더뱅킹정기적금"
          active={activeItem === "MG더뱅킹정기적금"}
          onClick={handleItemClick}
        />
        <Menu.Item
          name="MG더뱅킹자유적금"
          active={activeItem === "MG더뱅킹자유적금"}
          onClick={handleItemClick}
        />

        <Menu.Menu position="right">
          <Menu.Item name={`조회기준일 ${baseDate}`} />
          <Menu.Item
            name="help"
            active={activeItem === "help"}
            onClick={handleItemClick}
          />
        </Menu.Menu>
      </Menu>

      {activeItem === "MG더뱅킹정기예금" ? (
        <InteresetRateTable tableData={entriesA} />
      ) : null}
      {activeItem === "MG더뱅킹정기적금" ? (
        <InteresetRateTable tableData={entriesB} />
      ) : null}
      {activeItem === "MG더뱅킹자유적금" ? (
        <InteresetRateTable tableData={entriesC} />
      ) : null}
      {activeItem === "help" ? <Help entries={tableData} /> : null}
    </Container>
  );
}

export default App;
