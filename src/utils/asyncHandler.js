// Higher Order Funcions Syntax
// const asyncFn = () =>{}
// const asyncFn = (fn) => ()=>{}
// const asyncFn = (fn) => { ()=>{} }

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};
export { asyncHandler };

//Promise
/* const myPromise = new Promise((resolve, reject) => {});

myPromise
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.log(error);
  });

async function promiseFn() {
  try {
    await myPromise;
  } catch (error) {
    console.log(error);
  }
} */
