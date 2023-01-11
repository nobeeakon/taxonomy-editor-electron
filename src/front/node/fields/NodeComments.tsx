type Props = {
  comments: string[];
  updateComments: (newValue: string[]) => void;
};

const NodeComments = ({ comments, updateComments }: Props) => {
  const onChangeComments = (newComments: string) =>
    updateComments(newComments.split("\n"));

  return (
    <textarea
      style={{ width: "100%" }}
      value={comments.join("\n")}
      onChange={(event) => onChangeComments(event.target.value)}
    />
  );
};

export default NodeComments;
