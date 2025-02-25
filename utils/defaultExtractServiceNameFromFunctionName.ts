export default (funcitonName: string) => {
  const serviceName = funcitonName.split('-')[0];

  return serviceName;
};