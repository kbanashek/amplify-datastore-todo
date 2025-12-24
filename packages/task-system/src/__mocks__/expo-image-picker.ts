export const requestCameraPermissionsAsync = jest.fn(() =>
  Promise.resolve({ status: "granted" })
);

export const launchCameraAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [{ uri: "file://test-image.jpg" }],
  })
);

export const launchImageLibraryAsync = jest.fn(() =>
  Promise.resolve({
    canceled: false,
    assets: [{ uri: "file://test-image.jpg" }],
  })
);

export const MediaTypeOptions = {
  Images: "Images",
};

const expoImagePicker = {
  requestCameraPermissionsAsync,
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
};

export default expoImagePicker;
