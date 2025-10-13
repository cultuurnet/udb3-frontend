// Convert a string like EXAMPLE_PERMISSION into "Example permission" by replacing underscores with spaces, converting to lowercase, and capitalizing the first letter.
const formatPermission = (permission: string) =>
  permission
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

export { formatPermission };
