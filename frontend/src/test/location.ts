let lastLocation = '';

/** The URL (path + query) the app is currently showing, as a user would see in the address bar. */
export const currentUrl = () => lastLocation;

export const recordLocation = (url: string) => {
  lastLocation = url;
};
