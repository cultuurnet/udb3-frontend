type Props = {
  search: string;
  children: string;
};

const renderHighlightedLabel = (label: string, query: string) => {
  if (!query) return label;

  const matchIndex = label.toLowerCase().indexOf(query.toLowerCase());
  if (matchIndex === -1) return label;

  return (
    <span>
      {label.slice(0, matchIndex)}
      <strong className="tw:font-bold">
        {label.slice(matchIndex, matchIndex + query.length)}
      </strong>
      {label.slice(matchIndex + query.length)}
    </span>
  );
};

const Highlighter = ({ search, children }: Props) => (
  <span>{renderHighlightedLabel(children, search)}</span>
);

export { Highlighter };
