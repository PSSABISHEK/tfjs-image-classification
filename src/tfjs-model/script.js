// load tensorflow
let tf = require("@tensorflow/tfjs");
tf.enableProdMode();

console.log("yeeterson");

//const INDEXED_DB_URL = "indexeddb://modebile";

const img_to_tensor = (img) => {
  return tf.tidy(() => {
    const img_tensor = tf.browser.fromPixels(img);

    // add an outer dimension
    const batch_tensor = img_tensor.expandDims(0);
    const norm_tensor = batch_tensor
      .toFloat()
      .div(tf.scalar(127))
      .sub(tf.scalar(1));
    return norm_tensor;
  });
};

export async function infer_model(img) {
  let tens = await img_to_tensor(img);
  const model = await tf.loadGraphModel(
    "https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json"
  );
  let preds = await model.predict(tens);
  const axis = 1;
  const index = await preds.argMax(axis).data();
  return index;
}
