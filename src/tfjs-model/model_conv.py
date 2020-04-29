#%%
from tensorflow import keras
model = keras.applications.mobilenet_v2.MobileNetV2(input_shape= (224, 224, 3), alpha=1.0, include_top=True, weights='imagenet')
print("downloaded model")

# model_json = model.to_json()
# with open("mobilenetv2.json", "w") as json_file:
#     json_file.write(model_json)
# serialize weights to HDF5
model.save("mobilenetv2.h5")
print("Saved model to disk")