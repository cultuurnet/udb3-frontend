const parseOfferType = (context: any) => {
  return context.toString().split('/').pop();
};

export { parseOfferType };
