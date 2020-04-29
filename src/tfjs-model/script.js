// load tensorflow
let tf = require("@tensorflow/tfjs");
tf.enableProdMode();

console.log("yeeterson");

// initialize constants
const BASE_MODEL_URL = "https://alpha-model.herokuapp.com/download";
const INDEXED_DB_URL = "indexeddb://base-model";

class train_model {
  EXAMPLES;
  LABELS;
  NUM_CLASS;
  CLASS_NAMES;
  CLASS_NAME_TO_IDX;
  TRUNCATED_MODEL;
  CUSTOM_MODEL;
  FULL_MODEL;

  constructor() {
    // initilialize vaiables
    this.EXAMPLES = [];
    this.LABELS = [];
    this.NUM_CLASS = 0;
    this.CLASS_NAMES = [];
    this.CLASS_NAME_TO_IDX = {};
    this.TRUNCATED_MODEL = null;
    this.CUSTOM_MODEL = null;
    this.FULL_MODEL = null;
  }

  // creates 0 tensors
  // loads the full mobilenet model from the server
  load_base_model = async () => {
    // Load the full model
    const model = await tf.loadLayersModel(BASE_MODEL_URL);

    // save it to indexedDB
    await model.save(INDEXED_DB_URL);

    // memory management
    model.dispose();
  };

  // checks if the full mobilenet model is already loaded
  is_base_model_loaded = async () => {
    const all_models = await tf.io.listModels();

    if (INDEXED_DB_URL in all_models) {
      return true;
    } else {
      return false;
    }
  };

  // creates 262 tensors
  // loads the truncated model
  load_truncated_model = async () => {
    const model_present = await this.is_base_model_loaded();

    if (!model_present) {
      await this.load_base_model();
    }

    const base_model = await tf.loadLayersModel(INDEXED_DB_URL);
    const num_layers = base_model.layers.length;
    const last_layer = base_model.getLayer(null, num_layers - 2);

    const truncated_model = tf.model({
      inputs: base_model.inputs,
      outputs: last_layer.output,
    });
    return truncated_model;
  };

  is_truncated_model_loaded = () => {
    if (this.TRUNCATED_MODEL === null) {
      return false;
    } else {
      return true;
    }
  };

  // Creates 3 tensors
  load_custom_model = () => {
    const input_shape = this.TRUNCATED_MODEL.outputs[0].shape.slice(1);
    const input_size = tf.util.sizeFromShape(input_shape);

    const variance_scaling = tf.initializers.varianceScaling({});

    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [input_size],
          units: 100,
          activation: "relu",
          kernelInitializer: variance_scaling,
          useBias: true,
        }),
        tf.layers.dense({
          kernelInitializer: variance_scaling,
          useBias: false,
          activation: "softmax",
          units: this.NUM_CLASS,
        }),
      ],
    });

    return model;
  };

  is_custom_model_loaded = () => {
    if (this.CUSTOM_MODEL === null) {
      return false;
    } else {
      return true;
    }
  };

  // creates 0 tensors
  set_variables = (class_arr) => {
    this.CLASS_NAMES = class_arr;
    this.NUM_CLASS = class_arr.length;

    for (let i = 0; i < this.NUM_CLASS; i++) {
      this.CLASS_NAME_TO_IDX[class_arr[i]] = i;
    }
  };

  img_to_tensor = (img) => {
    return tf.tidy(() => {
      const img_tensor = tf.browser.fromPixels(img);

      // add an outer dimension
      const batch_tensor = img_tensor.expandDims(0);

      const norm_tensor = this.normalize_tensor(batch_tensor);

      return norm_tensor;
    });
  };

  normalize_tensor = (img_tensor) => {
    // Normalize the image between -1 and 1
    return img_tensor.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  };

  add_example = async (img, class_name) => {
    const img_tensor = this.img_to_tensor(img);
    const prediction = this.TRUNCATED_MODEL.predict(img_tensor);
    const activation = await prediction.data();

    prediction.dispose();
    img_tensor.dispose();

    this.EXAMPLES.push(activation);

    const class_int = this.CLASS_NAME_TO_IDX[class_name];
    this.LABELS.push(class_int);
  };

  randomize_dataset = async (img_arr, label_arr) => {
    const arr_len = label_arr.length;

    const rand_indices = tf.util.createShuffledIndices(arr_len);
    let temp_rand_indices = [];
    for (let i = 0; i < arr_len; i++) {
      temp_rand_indices.push(rand_indices[i]);
    }

    const shuffled_img_tensor = tf.gather(img_arr, temp_rand_indices);
    const shuffled_label_tensor = tf.gather(label_arr, temp_rand_indices);

    const shuffled_img_arr = await shuffled_img_tensor.data();
    const shuffled_label_arr = await shuffled_label_tensor.data();

    shuffled_img_tensor.dispose();
    shuffled_label_tensor.dispose();

    return [shuffled_img_arr, shuffled_label_arr];
  };

  dispose_all = () => {
    this.FULL_MODEL.dispose();
    tf.disposeVariables();
  };

  train_model = async (
    examples_dict,
    class_names_arr,
    argEpochs,
    argBatchSize,
    argLearningRate
  ) => {
    this.set_variables(class_names_arr);

    this.TRUNCATED_MODEL = await this.load_truncated_model();

    for (let curr_class_name in examples_dict) {
      let curr_img_arr = examples_dict[curr_class_name];
      for (let i = 0; i < curr_img_arr.length; i++) {
        await this.add_example(curr_img_arr[i], curr_class_name);
      }
    }

    const rand_dataset = await this.randomize_dataset(
      this.EXAMPLES,
      this.LABELS
    );

    let data_x = rand_dataset[0];
    let data_y = rand_dataset[1];

    const tensor_shape = [this.EXAMPLES.length, this.EXAMPLES[0].length];

    data_x = tf.tensor2d(data_x, tensor_shape);
    data_y = tf.oneHot(data_y, this.NUM_CLASS);

    this.CUSTOM_MODEL = this.load_custom_model();

    const model_optimizer = tf.train.adam(argLearningRate);

    this.CUSTOM_MODEL.compile({
      optimizer: model_optimizer,
      loss: "categoricalCrossentropy",
      metrics: ["accuracy"],
    });

    const history = await this.CUSTOM_MODEL.fit(data_x, data_y, {
      batchSize: argBatchSize,
      epochs: argEpochs,
      validationSplit: 0.15,
      callbacks: {
        onEpochEnd: async (epoch, logs) => {
          console.log("Acc : " + logs.val_acc + " Loss : " + logs.val_loss);
        },
      },
      shuffle: true,
    });

    const full_model = tf.sequential();
    full_model.add(this.TRUNCATED_MODEL);
    full_model.add(this.CUSTOM_MODEL);
    this.FULL_MODEL = full_model;

    data_x.dispose();
    data_y.dispose();
    model_optimizer.dispose();
    return this.FULL_MODEL;
  };
}

export default train_model;
