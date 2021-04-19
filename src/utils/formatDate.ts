const formatDate = (date: any) => {
  const passedDate = new Date(date);
  return passedDate.toISOString().split('.')[0] + 'Z';
};

export { formatDate };
