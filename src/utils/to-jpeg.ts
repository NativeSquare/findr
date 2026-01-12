import * as ImageManipulator from "expo-image-manipulator";

export async function toJpeg(uri: string) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [], // no resize needed
    {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return result; // { uri, width, height }
}
