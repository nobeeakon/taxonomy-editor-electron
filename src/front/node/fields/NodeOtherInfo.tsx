import ISO6391 from "iso-639-1";

import type { GraphNodeType } from "../../../back/read/graph/buildGraph";

type Props = {
  nodeOtherInfo: GraphNodeType["otherInfo"];
  updateNodeOtherInfo: (newValue: GraphNodeType["otherInfo"]) => void;
};

const NodeOtherInfo = ({ nodeOtherInfo, updateNodeOtherInfo }: Props) => {
  const onOtherInfoChange = (
    index: number,
    newValue: string,
    type: "property" | "languageCode" | "value"
  ) => {
    const newOtherInfo = [...nodeOtherInfo];
    const newItem = { ...newOtherInfo[index] };

    newItem[type] = newValue;

    newOtherInfo[index] = newItem;
    updateNodeOtherInfo(newOtherInfo);
  };

  const onRemoveOtherInfo = (index: number) => {
    const newOtherInfo = [...nodeOtherInfo];

    newOtherInfo.splice(index, 1);

    updateNodeOtherInfo(newOtherInfo);
  };

  const onAddOtherInfo = () => {
    const newOtherInfo = [...nodeOtherInfo];

    newOtherInfo.push({
      property: "",
      languageCode: "",
      value: "",
      isDeprecated: false,
    });

    updateNodeOtherInfo(newOtherInfo);
  };

  if (nodeOtherInfo.length === 0) return <div>No more info</div>;

  return (
    <div>
      {/* TODO add a link and open option */}
      <div>
        {" "}
        <i>
          NOTE: May contain invalid language codes. We are using: ISO 639-1{" "}
        </i>
      </div>
      <table style={{ border: "1px solid grey", margin: "2rem" }}>
        <thead>
          <th>Property</th>
          <th>Language</th>
          <th>Info</th>
        </thead>
        <tbody>
          {nodeOtherInfo.map(({ property, languageCode, value }, index) => (
            <tr key={`${property}-${languageCode}-${value}`}>
              <td>
                {" "}
                <input
                  type="text"
                  value={property}
                  onChange={(event) =>
                    onOtherInfoChange(index, event.target.value, "property")
                  }
                />{" "}
              </td>
              <td>
                {!languageCode || ISO6391.validate(languageCode) ? (
                  <select
                    value={languageCode}
                    onChange={(event) =>
                      onOtherInfoChange(
                        index,
                        event.target.value,
                        "languageCode"
                      )
                    }
                  >
                    {ISO6391.getAllCodes().map((languageCodeItem) => (
                      <option key={languageCodeItem} value={languageCodeItem}>
                        {ISO6391.getName(languageCodeItem)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={languageCode}
                    onChange={(event) =>
                      onOtherInfoChange(
                        index,
                        event.target.value,
                        "languageCode"
                      )
                    }
                  />
                )}
              </td>
              <td>
                <input
                  type="text"
                  value={value}
                  onChange={(event) =>
                    onOtherInfoChange(index, event.target.value, "value")
                  }
                />
              </td>
              <td>
                <button onClick={() => onRemoveOtherInfo(index)}>remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => onAddOtherInfo()}>Add property</button>
    </div>
  );
};

export default NodeOtherInfo;
