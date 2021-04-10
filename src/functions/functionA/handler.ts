const fcn1 = async function () {
  try {
    const newDetails = { "message" : "Hello, sunt functia A",
                    "arrived": true}
    return newDetails
  } catch (err) {
    console.log(err);
  }
};

export const main = fcn1;
