const fcn3 = async function (event) {
    try {
      const newDetails = { "message" : event.message,
      "arrived": true}
  return newDetails
    } catch (err) {
      console.log(err);
    }
  };
  
  export const main = fcn3;
  